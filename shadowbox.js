/*
 * Shadowbox.js, version 3.0.3
 * http://shadowbox-js.com/
 *
 * Copyright 2007-2010, Michael J. I. Jackson
 * Date: 2011-05-14 06:45:24 +0000
 */
(function (window, undefined) {
    var S = {
        version: "3.0.3"
    };
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("windows") > -1 || ua.indexOf("win32") > -1) {
        S.isWindows = true
    } else {
        if (ua.indexOf("macintosh") > -1 || ua.indexOf("mac os x") > -1) {
            S.isMac = true
        } else {
            if (ua.indexOf("linux") > -1) {
                S.isLinux = true
            }
        }
    }
    S.isIE = ua.indexOf("msie") > -1;
    S.isIE6 = ua.indexOf("msie 6") > -1;
    S.isIE7 = ua.indexOf("msie 7") > -1;
    S.isGecko = ua.indexOf("gecko") > -1 && ua.indexOf("safari") == -1;
    S.isWebKit = ua.indexOf("applewebkit/") > -1;
    var inlineId = /#(.+)$/,
        galleryName = /^(light|shadow)box\[(.*?)\]/i,
        inlineParam = /\s*([a-z_]*?)\s*=\s*(.+)\s*/,
        fileExtension = /[0-9a-z]+$/i,
        scriptPath = /(.+\/)shadowbox\.js/i;
    var open = false,
        initialized = false,
        lastOptions = {},
        slideDelay = 0,
        slideStart, slideTimer;
    S.current = -1;
    S.dimensions = null;
    S.ease = function (state) {
        return 1 + Math.pow(state - 1, 3)
    };
    S.errorInfo = {
        fla: {
            name: "Flash",
            url: "http://www.adobe.com/products/flashplayer/"
        },
        qt: {
            name: "QuickTime",
            url: "http://www.apple.com/quicktime/download/"
        },
        wmp: {
            name: "Windows Media Player",
            url: "http://www.microsoft.com/windows/windowsmedia/"
        },
        f4m: {
            name: "Flip4Mac",
            url: "http://www.flip4mac.com/wmv_download.htm"
        }
    };
    S.gallery = [];
    S.onReady = noop;
    S.path = null;
    S.player = null;
    S.playerId = "sb-player";
    S.options = {
        animate: true,
        animateFade: true,
        autoplayMovies: true,
        continuous: false,
        enableKeys: true,
        flashParams: {
            bgcolor: "#000000",
            allowfullscreen: true
        },
        flashVars: {},
        flashVersion: "9.0.115",
        handleOversize: "resize",
        handleUnsupported: "link",
        onChange: noop,
        onClose: noop,
        onFinish: noop,
        onOpen: noop,
        showMovieControls: true,
        skipSetup: false,
        slideshowDelay: 0,
        viewportPadding: 20
    };
    S.getCurrent = function () {
        return S.current > -1 ? S.gallery[S.current] : null
    };
    S.hasNext = function () {
        return S.gallery.length > 1 && (S.current != S.gallery.length - 1 || S.options.continuous)
    };
    S.isOpen = function () {
        return open
    };
    S.isPaused = function () {
        return slideTimer == "pause"
    };
    S.applyOptions = function (options) {
        lastOptions = apply({}, S.options);
        apply(S.options, options)
    };
    S.revertOptions = function () {
        apply(S.options, lastOptions)
    };
    S.init = function (options, callback) {
        if (initialized) {
            return
        }
        initialized = true;
        if (S.skin.options) {
            apply(S.options, S.skin.options)
        }
        if (options) {
            apply(S.options, options)
        }
        if (!S.path) {
            var path, scripts = document.getElementsByTagName("script");
            for (var i = 0, len = scripts.length; i < len; ++i) {
                path = scriptPath.exec(scripts[i].src);
                if (path) {
                    S.path = path[1];
                    break
                }
            }
        }
        if (callback) {
            S.onReady = callback
        }
        bindLoad()
    };
    S.open = function (obj) {
        if (open) {
            return
        }
        var gc = S.makeGallery(obj);
        S.gallery = gc[0];
        S.current = gc[1];
        obj = S.getCurrent();
        if (obj == null) {
            return
        }
        S.applyOptions(obj.options || {});
        filterGallery();
        if (S.gallery.length) {
            obj = S.getCurrent();
            if (S.options.onOpen(obj) === false) {
                return
            }
            open = true;
            S.skin.onOpen(obj, load)
        }
    };
    S.close = function () {
        if (!open) {
            return
        }
        open = false;
        if (S.player) {
            S.player.remove();
            S.player = null
        }
        if (typeof slideTimer == "number") {
            clearTimeout(slideTimer);
            slideTimer = null
        }
        slideDelay = 0;
        listenKeys(false);
        S.options.onClose(S.getCurrent());
        S.skin.onClose();
        S.revertOptions()
    };
    S.play = function () {
        if (!S.hasNext()) {
            return
        }
        if (!slideDelay) {
            slideDelay = S.options.slideshowDelay * 1000
        }
        if (slideDelay) {
            slideStart = now();
            slideTimer = setTimeout(function () {
                slideDelay = slideStart = 0;
                S.next()
            }, slideDelay);
            if (S.skin.onPlay) {
                S.skin.onPlay()
            }
        }
    };
    S.pause = function () {
        if (typeof slideTimer != "number") {
            return
        }
        slideDelay = Math.max(0, slideDelay - (now() - slideStart));
        if (slideDelay) {
            clearTimeout(slideTimer);
            slideTimer = "pause";
            if (S.skin.onPause) {
                S.skin.onPause()
            }
        }
    };
    S.change = function (index) {
        if (!(index in S.gallery)) {
            if (S.options.continuous) {
                index = (index < 0 ? S.gallery.length + index : 0);
                if (!(index in S.gallery)) {
                    return
                }
            } else {
                return
            }
        }
        S.current = index;
        if (typeof slideTimer == "number") {
            clearTimeout(slideTimer);
            slideTimer = null;
            slideDelay = slideStart = 0
        }
        S.options.onChange(S.getCurrent());
        load(true)
    };
    S.next = function () {
        S.change(S.current + 1)
    };
    S.previous = function () {
        S.change(S.current - 1)
    };
    S.setDimensions = function (height, width, maxHeight, maxWidth, topBottom, leftRight, padding, preserveAspect) {
        var originalHeight = height,
            originalWidth = width;
        var extraHeight = 2 * padding + topBottom;
        if (height + extraHeight > maxHeight) {
            height = maxHeight - extraHeight
        }
        var extraWidth = 2 * padding + leftRight;
        if (width + extraWidth > maxWidth) {
            width = maxWidth - extraWidth
        }
        var changeHeight = (originalHeight - height) / originalHeight,
            changeWidth = (originalWidth - width) / originalWidth,
            oversized = (changeHeight > 0 || changeWidth > 0);
        if (preserveAspect && oversized) {
            if (changeHeight > changeWidth) {
                width = Math.round((originalWidth / originalHeight) * height)
            } else {
                if (changeWidth > changeHeight) {
                    height = Math.round((originalHeight / originalWidth) * width)
                }
            }
        }
        S.dimensions = {
            height: height + topBottom,
            width: width + leftRight,
            innerHeight: height,
            innerWidth: width,
            top: Math.floor((maxHeight - (height + extraHeight)) / 2 + padding),
            left: Math.floor((maxWidth - (width + extraWidth)) / 2 + padding),
            oversized: oversized
        };
        return S.dimensions
    };
    S.makeGallery = function (obj) {
        var gallery = [],
            current = -1;
        if (typeof obj == "string") {
            obj = [obj]
        }
        if (typeof obj.length == "number") {
            each(obj, function (i, o) {
                if (o.content) {
                    gallery[i] = o
                } else {
                    gallery[i] = {
                        content: o
                    }
                }
            });
            current = 0
        } else {
            if (obj.tagName) {
                var cacheObj = S.getCache(obj);
                obj = cacheObj ? cacheObj : S.makeObject(obj)
            }
            if (obj.gallery) {
                gallery = [];
                var o;
                for (var key in S.cache) {
                    o = S.cache[key];
                    if (o.gallery && o.gallery == obj.gallery) {
                        if (current == -1 && o.content == obj.content) {
                            current = gallery.length
                        }
                        gallery.push(o)
                    }
                }
                if (current == -1) {
                    gallery.unshift(obj);
                    current = 0
                }
            } else {
                gallery = [obj];
                current = 0
            }
        }
        each(gallery, function (i, o) {
            gallery[i] = apply({}, o)
        });
        return [gallery, current]
    };
    S.makeObject = function (link, options) {
        var obj = {
            content: link.href,
            title: link.getAttribute("title") || "",
            link: link
        };
        if (options) {
            options = apply({}, options);
            each(["player", "title", "height", "width", "gallery"], function (i, o) {
                if (typeof options[o] != "undefined") {
                    obj[o] = options[o];
                    delete options[o]
                }
            });
            obj.options = options
        } else {
            obj.options = {}
        }
        if (!obj.player) {
            obj.player = S.getPlayer(obj.content)
        }
        var rel = link.getAttribute("rel");
        if (rel) {
            var match = rel.match(galleryName);
            if (match) {
                obj.gallery = escape(match[2])
            }
            each(rel.split(";"), function (i, p) {
                match = p.match(inlineParam);
                if (match) {
                    obj[match[1]] = match[2]
                }
            })
        }
        return obj
    };
    S.getPlayer = function (content) {
        if (content.indexOf("#") > -1 && content.indexOf(document.location.href) == 0) {
            return "inline"
        }
        var q = content.indexOf("?");
        if (q > -1) {
            content = content.substring(0, q)
        }
        var ext, m = content.match(fileExtension);
        if (m) {
            ext = m[0].toLowerCase()
        }
        if (ext) {
            if (S.img && S.img.ext.indexOf(ext) > -1) {
                return "img"
            }
            if (S.swf && S.swf.ext.indexOf(ext) > -1) {
                return "swf"
            }
            if (S.flv && S.flv.ext.indexOf(ext) > -1) {
                return "flv"
            }
            if (S.qt && S.qt.ext.indexOf(ext) > -1) {
                if (S.wmp && S.wmp.ext.indexOf(ext) > -1) {
                    return "qtwmp"
                } else {
                    return "qt"
                }
            }
            if (S.wmp && S.wmp.ext.indexOf(ext) > -1) {
                return "wmp"
            }
        }
        return "iframe"
    };

    function filterGallery() {
        var err = S.errorInfo,
            plugins = S.plugins,
            obj, remove, needed, m, format, replace, inlineEl, flashVersion;
        for (var i = 0; i < S.gallery.length; ++i) {
            obj = S.gallery[i];
            remove = false;
            needed = null;
            switch (obj.player) {
            case "flv":
            case "swf":
                if (!plugins.fla) {
                    needed = "fla"
                }
                break;
            case "qt":
                if (!plugins.qt) {
                    needed = "qt"
                }
                break;
            case "wmp":
                if (S.isMac) {
                    if (plugins.qt && plugins.f4m) {
                        obj.player = "qt"
                    } else {
                        needed = "qtf4m"
                    }
                } else {
                    if (!plugins.wmp) {
                        needed = "wmp"
                    }
                }
                break;
            case "qtwmp":
                if (plugins.qt) {
                    obj.player = "qt"
                } else {
                    if (plugins.wmp) {
                        obj.player = "wmp"
                    } else {
                        needed = "qtwmp"
                    }
                }
                break
            }
            if (needed) {
                if (S.options.handleUnsupported == "link") {
                    switch (needed) {
                    case "qtf4m":
                        format = "shared";
                        replace = [err.qt.url, err.qt.name, err.f4m.url, err.f4m.name];
                        break;
                    case "qtwmp":
                        format = "either";
                        replace = [err.qt.url, err.qt.name, err.wmp.url, err.wmp.name];
                        break;
                    default:
                        format = "single";
                        replace = [err[needed].url, err[needed].name]
                    }
                    obj.player = "html";
                    obj.content = '<div class="sb-message">' + sprintf(S.lang.errors[format], replace) + "</div>"
                } else {
                    remove = true
                }
            } else {
                if (obj.player == "inline") {
                    m = inlineId.exec(obj.content);
                    if (m) {
                        inlineEl = get(m[1]);
                        if (inlineEl) {
                            obj.content = inlineEl.innerHTML
                        } else {
                            remove = true
                        }
                    } else {
                        remove = true
                    }
                } else {
                    if (obj.player == "swf" || obj.player == "flv") {
                        flashVersion = (obj.options && obj.options.flashVersion) || S.options.flashVersion;
                        if (S.flash && !S.flash.hasFlashPlayerVersion(flashVersion)) {
                            obj.width = 310;
                            obj.height = 177
                        }
                    }
                }
            }
            if (remove) {
                S.gallery.splice(i, 1);
                if (i < S.current) {
                    --S.current
                } else {
                    if (i == S.current) {
                        S.current = i > 0 ? i - 1 : i
                    }
                }--i
            }
        }
    }
    function listenKeys(on) {
        if (!S.options.enableKeys) {
            return
        }(on ? addEvent : removeEvent)(document, "keydown", handleKey)
    }
    function handleKey(e) {
        if (e.metaKey || e.shiftKey || e.altKey || e.ctrlKey) {
            return
        }
        var code = keyCode(e),
            handler;
        switch (code) {
        case 81:
        case 88:
        case 27:
            handler = S.close;
            break;
        case 37:
            handler = S.previous;
            break;
        case 39:
            handler = S.next;
            break;
        case 32:
            handler = typeof slideTimer == "number" ? S.pause : S.play;
            break
        }
        if (handler) {
            preventDefault(e);
            handler()
        }
    }
    function load(changing) {
        listenKeys(false);
        var obj = S.getCurrent();
        var player = (obj.player == "inline" ? "html" : obj.player);
        if (typeof S[player] != "function") {
            throw "unknown player " + player
        }
        if (changing) {
            S.player.remove();
            S.revertOptions();
            S.applyOptions(obj.options || {})
        }
        S.player = new S[player](obj, S.playerId);
        if (S.gallery.length > 1) {
            var next = S.gallery[S.current + 1] || S.gallery[0];
            if (next.player == "img") {
                var a = new Image();
                a.src = next.content
            }
            var prev = S.gallery[S.current - 1] || S.gallery[S.gallery.length - 1];
            if (prev.player == "img") {
                var b = new Image();
                b.src = prev.content
            }
        }
        S.skin.onLoad(changing, waitReady)
    }
    function waitReady() {
        if (!open) {
            return
        }
        if (typeof S.player.ready != "undefined") {
            var timer = setInterval(function () {
                if (open) {
                    if (S.player.ready) {
                        clearInterval(timer);
                        timer = null;
                        S.skin.onReady(show)
                    }
                } else {
                    clearInterval(timer);
                    timer = null
                }
            }, 10)
        } else {
            S.skin.onReady(show)
        }
    }
    function show() {
        if (!open) {
            return
        }
        S.player.append(S.skin.body, S.dimensions);
        S.skin.onShow(finish)
    }
    function finish() {
        if (!open) {
            return
        }
        if (S.player.onLoad) {
            S.player.onLoad()
        }
        S.options.onFinish(S.getCurrent());
        if (!S.isPaused()) {
            S.play()
        }
        listenKeys(true)
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, from) {
            var len = this.length >>> 0;
            from = from || 0;
            if (from < 0) {
                from += len
            }
            for (; from < len; ++from) {
                if (from in this && this[from] === obj) {
                    return from
                }
            }
            return -1
        }
    }
    function now() {
        return (new Date).getTime()
    }
    function apply(original, extension) {
        for (var property in extension) {
            original[property] = extension[property]
        }
        return original
    }
    function each(obj, callback) {
        var i = 0,
            len = obj.length;
        for (var value = obj[0]; i < len && callback.call(value, i, value) !== false; value = obj[++i]) {}
    }
    function sprintf(str, replace) {
        return str.replace(/\{(\w+?)\}/g, function (match, i) {
            return replace[i]
        })
    }
    function noop() {}
    function get(id) {
        return document.getElementById(id)
    }
    function remove(el) {
        el.parentNode.removeChild(el)
    }
    var supportsOpacity = true,
        supportsFixed = true;

    function checkSupport() {
        var body = document.body,
            div = document.createElement("div");
        supportsOpacity = typeof div.style.opacity === "string";
        div.style.position = "fixed";
        div.style.margin = 0;
        div.style.top = "20px";
        body.appendChild(div, body.firstChild);
        supportsFixed = div.offsetTop == 20;
        body.removeChild(div)
    }
    S.getStyle = (function () {
        var opacity = /opacity=([^)]*)/,
            getComputedStyle = document.defaultView && document.defaultView.getComputedStyle;
        return function (el, style) {
            var ret;
            if (!supportsOpacity && style == "opacity" && el.currentStyle) {
                ret = opacity.test(el.currentStyle.filter || "") ? (parseFloat(RegExp.$1) / 100) + "" : "";
                return ret === "" ? "1" : ret
            }
            if (getComputedStyle) {
                var computedStyle = getComputedStyle(el, null);
                if (computedStyle) {
                    ret = computedStyle[style]
                }
                if (style == "opacity" && ret == "") {
                    ret = "1"
                }
            } else {
                ret = el.currentStyle[style]
            }
            return ret
        }
    })();
    S.appendHTML = function (el, html) {
        if (el.insertAdjacentHTML) {
            el.insertAdjacentHTML("BeforeEnd", html)
        } else {
            if (el.lastChild) {
                var range = el.ownerDocument.createRange();
                range.setStartAfter(el.lastChild);
                var frag = range.createContextualFragment(html);
                el.appendChild(frag)
            } else {
                el.innerHTML = html
            }
        }
    };
    S.getWindowSize = function (dimension) {
        if (document.compatMode === "CSS1Compat") {
            return document.documentElement["client" + dimension]
        }
        return document.body["client" + dimension]
    };
    S.setOpacity = function (el, opacity) {
        var style = el.style;
        if (supportsOpacity) {
            style.opacity = (opacity == 1 ? "" : opacity)
        } else {
            style.zoom = 1;
            if (opacity == 1) {
                if (typeof style.filter == "string" && (/alpha/i).test(style.filter)) {
                    style.filter = style.filter.replace(/\s*[\w\.]*alpha\([^\)]*\);?/gi, "")
                }
            } else {
                style.filter = (style.filter || "").replace(/\s*[\w\.]*alpha\([^\)]*\)/gi, "") + " alpha(opacity=" + (opacity * 100) + ")"
            }
        }
    };
    S.clearOpacity = function (el) {
        S.setOpacity(el, 1)
    };

    function getTarget(e) {
        var target = e.target ? e.target : e.srcElement;
        return target.nodeType == 3 ? target.parentNode : target
    }
    function getPageXY(e) {
        var x = e.pageX || (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft)),
            y = e.pageY || (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
        return [x, y]
    }
    function preventDefault(e) {
        e.preventDefault()
    }
    function keyCode(e) {
        return e.which ? e.which : e.keyCode
    }
    function addEvent(el, type, handler) {
        if (el.addEventListener) {
            el.addEventListener(type, handler, false)
        } else {
            if (el.nodeType === 3 || el.nodeType === 8) {
                return
            }
            if (el.setInterval && (el !== window && !el.frameElement)) {
                el = window
            }
            if (!handler.__guid) {
                handler.__guid = addEvent.guid++
            }
            if (!el.events) {
                el.events = {}
            }
            var handlers = el.events[type];
            if (!handlers) {
                handlers = el.events[type] = {};
                if (el["on" + type]) {
                    handlers[0] = el["on" + type]
                }
            }
            handlers[handler.__guid] = handler;
            el["on" + type] = addEvent.handleEvent
        }
    }
    addEvent.guid = 1;
    addEvent.handleEvent = function (event) {
        var result = true;
        event = event || addEvent.fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
        var handlers = this.events[event.type];
        for (var i in handlers) {
            this.__handleEvent = handlers[i];
            if (this.__handleEvent(event) === false) {
                result = false
            }
        }
        return result
    };
    addEvent.preventDefault = function () {
        this.returnValue = false
    };
    addEvent.stopPropagation = function () {
        this.cancelBubble = true
    };
    addEvent.fixEvent = function (e) {
        e.preventDefault = addEvent.preventDefault;
        e.stopPropagation = addEvent.stopPropagation;
        return e
    };

    function removeEvent(el, type, handler) {
        if (el.removeEventListener) {
            el.removeEventListener(type, handler, false)
        } else {
            if (el.events && el.events[type]) {
                delete el.events[type][handler.__guid]
            }
        }
    }
    var loaded = false,
        DOMContentLoaded;
    if (document.addEventListener) {
        DOMContentLoaded = function () {
            document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
            S.load()
        }
    } else {
        if (document.attachEvent) {
            DOMContentLoaded = function () {
                if (document.readyState === "complete") {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                    S.load()
                }
            }
        }
    }
    function doScrollCheck() {
        if (loaded) {
            return
        }
        try {
            document.documentElement.doScroll("left")
        } catch (e) {
            setTimeout(doScrollCheck, 1);
            return
        }
        S.load()
    }
    function bindLoad() {
        if (document.readyState === "complete") {
            return S.load()
        }
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
            window.addEventListener("load", S.load, false)
        } else {
            if (document.attachEvent) {
                document.attachEvent("onreadystatechange", DOMContentLoaded);
                window.attachEvent("onload", S.load);
                var topLevel = false;
                try {
                    topLevel = window.frameElement === null
                } catch (e) {}
                if (document.documentElement.doScroll && topLevel) {
                    doScrollCheck()
                }
            }
        }
    }
    S.load = function () {
        if (loaded) {
            return
        }
        if (!document.body) {
            return setTimeout(S.load, 13)
        }
        loaded = true;
        checkSupport();
        S.onReady();
        if (!S.options.skipSetup) {
            S.setup()
        }
        S.skin.init()
    };
    S.plugins = {};
    if (navigator.plugins && navigator.plugins.length) {
        var names = [];
        each(navigator.plugins, function (i, p) {
            names.push(p.name)
        });
        names = names.join(",");
        var f4m = names.indexOf("Flip4Mac") > -1;
        S.plugins = {
            fla: names.indexOf("Shockwave Flash") > -1,
            qt: names.indexOf("QuickTime") > -1,
            wmp: !f4m && names.indexOf("Windows Media") > -1,
            f4m: f4m
        }
    } else {
        var detectPlugin = function (name) {
                var axo;
                try {
                    axo = new ActiveXObject(name)
                } catch (e) {}
                return !!axo
            };
        S.plugins = {
            fla: detectPlugin("ShockwaveFlash.ShockwaveFlash"),
            qt: detectPlugin("QuickTime.QuickTime"),
            wmp: detectPlugin("wmplayer.ocx"),
            f4m: false
        }
    }
    var relAttr = /^(light|shadow)box/i,
        expando = "shadowboxCacheKey",
        cacheKey = 1;
    S.cache = {};
    S.select = function (selector) {
        var links = [];
        if (!selector) {
            var rel;
            each(document.getElementsByTagName("a"), function (i, el) {
                rel = el.getAttribute("rel");
                if (rel && relAttr.test(rel)) {
                    links.push(el)
                }
            })
        } else {
            var length = selector.length;
            if (length) {
                if (typeof selector == "string") {
                    if (S.find) {
                        links = S.find(selector)
                    }
                } else {
                    if (length == 2 && typeof selector[0] == "string" && selector[1].nodeType) {
                        if (S.find) {
                            links = S.find(selector[0], selector[1])
                        }
                    } else {
                        for (var i = 0; i < length; ++i) {
                            links[i] = selector[i]
                        }
                    }
                }
            } else {
                links.push(selector)
            }
        }
        return links
    };
    S.setup = function (selector, options) {
        each(S.select(selector), function (i, link) {
            S.addCache(link, options)
        })
    };
    S.teardown = function (selector) {
        each(S.select(selector), function (i, link) {
            S.removeCache(link)
        })
    };
    S.addCache = function (link, options) {
        var key = link[expando];
        if (key == undefined) {
            key = cacheKey++;
            link[expando] = key;
            addEvent(link, "click", handleClick)
        }
        S.cache[key] = S.makeObject(link, options)
    };
    S.removeCache = function (link) {
        removeEvent(link, "click", handleClick);
        delete S.cache[link[expando]];
        link[expando] = null
    };
    S.getCache = function (link) {
        var key = link[expando];
        return (key in S.cache && S.cache[key])
    };
    S.clearCache = function () {
        for (var key in S.cache) {
            S.removeCache(S.cache[key].link)
        }
        S.cache = {}
    };

    function handleClick(e) {
        S.open(this);
        if (S.gallery.length) {
            preventDefault(e)
        }
    }
    /*
     * Sizzle CSS Selector Engine - v1.0
     *  Copyright 2009, The Dojo Foundation
     *  Released under the MIT, BSD, and GPL Licenses.
     *  More information: http://sizzlejs.com/
     *
     * Modified for inclusion in Shadowbox.js
     */
    S.find = (function () {
        var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
            done = 0,
            toString = Object.prototype.toString,
            hasDuplicate = false,
            baseHasDuplicate = true;
        [0, 0].sort(function () {
            baseHasDuplicate = false;
            return 0
        });
        var Sizzle = function (selector, context, results, seed) {
                results = results || [];
                var origContext = context = context || document;
                if (context.nodeType !== 1 && context.nodeType !== 9) {
                    return []
                }
                if (!selector || typeof selector !== "string") {
                    return results
                }
                var parts = [],
                    m, set, checkSet, extra, prune = true,
                    contextXML = isXML(context),
                    soFar = selector;
                while ((chunker.exec(""), m = chunker.exec(soFar)) !== null) {
                    soFar = m[3];
                    parts.push(m[1]);
                    if (m[2]) {
                        extra = m[3];
                        break
                    }
                }
                if (parts.length > 1 && origPOS.exec(selector)) {
                    if (parts.length === 2 && Expr.relative[parts[0]]) {
                        set = posProcess(parts[0] + parts[1], context)
                    } else {
                        set = Expr.relative[parts[0]] ? [context] : Sizzle(parts.shift(), context);
                        while (parts.length) {
                            selector = parts.shift();
                            if (Expr.relative[selector]) {
                                selector += parts.shift()
                            }
                            set = posProcess(selector, set)
                        }
                    }
                } else {
                    if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML && Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])) {
                        var ret = Sizzle.find(parts.shift(), context, contextXML);
                        context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0]
                    }
                    if (context) {
                        var ret = seed ? {
                            expr: parts.pop(),
                            set: makeArray(seed)
                        } : Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);
                        set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;
                        if (parts.length > 0) {
                            checkSet = makeArray(set)
                        } else {
                            prune = false
                        }
                        while (parts.length) {
                            var cur = parts.pop(),
                                pop = cur;
                            if (!Expr.relative[cur]) {
                                cur = ""
                            } else {
                                pop = parts.pop()
                            }
                            if (pop == null) {
                                pop = context
                            }
                            Expr.relative[cur](checkSet, pop, contextXML)
                        }
                    } else {
                        checkSet = parts = []
                    }
                }
                if (!checkSet) {
                    checkSet = set
                }
                if (!checkSet) {
                    throw "Syntax error, unrecognized expression: " + (cur || selector)
                }
                if (toString.call(checkSet) === "[object Array]") {
                    if (!prune) {
                        results.push.apply(results, checkSet)
                    } else {
                        if (context && context.nodeType === 1) {
                            for (var i = 0; checkSet[i] != null; i++) {
                                if (checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i]))) {
                                    results.push(set[i])
                                }
                            }
                        } else {
                            for (var i = 0; checkSet[i] != null; i++) {
                                if (checkSet[i] && checkSet[i].nodeType === 1) {
                                    results.push(set[i])
                                }
                            }
                        }
                    }
                } else {
                    makeArray(checkSet, results)
                }
                if (extra) {
                    Sizzle(extra, origContext, results, seed);
                    Sizzle.uniqueSort(results)
                }
                return results
            };
        Sizzle.uniqueSort = function (results) {
            if (sortOrder) {
                hasDuplicate = baseHasDuplicate;
                results.sort(sortOrder);
                if (hasDuplicate) {
                    for (var i = 1; i < results.length; i++) {
                        if (results[i] === results[i - 1]) {
                            results.splice(i--, 1)
                        }
                    }
                }
            }
            return results
        };
        Sizzle.matches = function (expr, set) {
            return Sizzle(expr, null, null, set)
        };
        Sizzle.find = function (expr, context, isXML) {
            var set, match;
            if (!expr) {
                return []
            }
            for (var i = 0, l = Expr.order.length; i < l; i++) {
                var type = Expr.order[i],
                    match;
                if ((match = Expr.leftMatch[type].exec(expr))) {
                    var left = match[1];
                    match.splice(1, 1);
                    if (left.substr(left.length - 1) !== "\\") {
                        match[1] = (match[1] || "").replace(/\\/g, "");
                        set = Expr.find[type](match, context, isXML);
                        if (set != null) {
                            expr = expr.replace(Expr.match[type], "");
                            break
                        }
                    }
                }
            }
            if (!set) {
                set = context.getElementsByTagName("*")
            }
            return {
                set: set,
                expr: expr
            }
        };
        Sizzle.filter = function (expr, set, inplace, not) {
            var old = expr,
                result = [],
                curLoop = set,
                match, anyFound, isXMLFilter = set && set[0] && isXML(set[0]);
            while (expr && set.length) {
                for (var type in Expr.filter) {
                    if ((match = Expr.match[type].exec(expr)) != null) {
                        var filter = Expr.filter[type],
                            found, item;
                        anyFound = false;
                        if (curLoop === result) {
                            result = []
                        }
                        if (Expr.preFilter[type]) {
                            match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);
                            if (!match) {
                                anyFound = found = true
                            } else {
                                if (match === true) {
                                    continue
                                }
                            }
                        }
                        if (match) {
                            for (var i = 0;
                            (item = curLoop[i]) != null; i++) {
                                if (item) {
                                    found = filter(item, match, i, curLoop);
                                    var pass = not ^ !! found;
                                    if (inplace && found != null) {
                                        if (pass) {
                                            anyFound = true
                                        } else {
                                            curLoop[i] = false
                                        }
                                    } else {
                                        if (pass) {
                                            result.push(item);
                                            anyFound = true
                                        }
                                    }
                                }
                            }
                        }
                        if (found !== undefined) {
                            if (!inplace) {
                                curLoop = result
                            }
                            expr = expr.replace(Expr.match[type], "");
                            if (!anyFound) {
                                return []
                            }
                            break
                        }
                    }
                }
                if (expr === old) {
                    if (anyFound == null) {
                        throw "Syntax error, unrecognized expression: " + expr
                    } else {
                        break
                    }
                }
                old = expr
            }
            return curLoop
        };
        var Expr = Sizzle.selectors = {
            order: ["ID", "NAME", "TAG"],
            match: {
                ID: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
                CLASS: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
                NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,
                ATTR: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
                TAG: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
                CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
                POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
                PSEUDO: /:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
            },
            leftMatch: {},
            attrMap: {
                "class": "className",
                "for": "htmlFor"
            },
            attrHandle: {
                href: function (elem) {
                    return elem.getAttribute("href")
                }
            },
            relative: {
                "+": function (checkSet, part) {
                    var isPartStr = typeof part === "string",
                        isTag = isPartStr && !/\W/.test(part),
                        isPartStrNotTag = isPartStr && !isTag;
                    if (isTag) {
                        part = part.toLowerCase()
                    }
                    for (var i = 0, l = checkSet.length, elem; i < l; i++) {
                        if ((elem = checkSet[i])) {
                            while ((elem = elem.previousSibling) && elem.nodeType !== 1) {}
                            checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ? elem || false : elem === part
                        }
                    }
                    if (isPartStrNotTag) {
                        Sizzle.filter(part, checkSet, true)
                    }
                },
                ">": function (checkSet, part) {
                    var isPartStr = typeof part === "string";
                    if (isPartStr && !/\W/.test(part)) {
                        part = part.toLowerCase();
                        for (var i = 0, l = checkSet.length; i < l; i++) {
                            var elem = checkSet[i];
                            if (elem) {
                                var parent = elem.parentNode;
                                checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false
                            }
                        }
                    } else {
                        for (var i = 0, l = checkSet.length; i < l; i++) {
                            var elem = checkSet[i];
                            if (elem) {
                                checkSet[i] = isPartStr ? elem.parentNode : elem.parentNode === part
                            }
                        }
                        if (isPartStr) {
                            Sizzle.filter(part, checkSet, true)
                        }
                    }
                },
                "": function (checkSet, part, isXML) {
                    var doneName = done++,
                        checkFn = dirCheck;
                    if (typeof part === "string" && !/\W/.test(part)) {
                        var nodeCheck = part = part.toLowerCase();
                        checkFn = dirNodeCheck
                    }
                    checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML)
                },
                "~": function (checkSet, part, isXML) {
                    var doneName = done++,
                        checkFn = dirCheck;
                    if (typeof part === "string" && !/\W/.test(part)) {
                        var nodeCheck = part = part.toLowerCase();
                        checkFn = dirNodeCheck
                    }
                    checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML)
                }
            },
            find: {
                ID: function (match, context, isXML) {
                    if (typeof context.getElementById !== "undefined" && !isXML) {
                        var m = context.getElementById(match[1]);
                        return m ? [m] : []
                    }
                },
                NAME: function (match, context) {
                    if (typeof context.getElementsByName !== "undefined") {
                        var ret = [],
                            results = context.getElementsByName(match[1]);
                        for (var i = 0, l = results.length; i < l; i++) {
                            if (results[i].getAttribute("name") === match[1]) {
                                ret.push(results[i])
                            }
                        }
                        return ret.length === 0 ? null : ret
                    }
                },
                TAG: function (match, context) {
                    return context.getElementsByTagName(match[1])
                }
            },
            preFilter: {
                CLASS: function (match, curLoop, inplace, result, not, isXML) {
                    match = " " + match[1].replace(/\\/g, "") + " ";
                    if (isXML) {
                        return match
                    }
                    for (var i = 0, elem;
                    (elem = curLoop[i]) != null; i++) {
                        if (elem) {
                            if (not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0)) {
                                if (!inplace) {
                                    result.push(elem)
                                }
                            } else {
                                if (inplace) {
                                    curLoop[i] = false
                                }
                            }
                        }
                    }
                    return false
                },
                ID: function (match) {
                    return match[1].replace(/\\/g, "")
                },
                TAG: function (match, curLoop) {
                    return match[1].toLowerCase()
                },
                CHILD: function (match) {
                    if (match[1] === "nth") {
                        var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" || !/\D/.test(match[2]) && "0n+" + match[2] || match[2]);
                        match[2] = (test[1] + (test[2] || 1)) - 0;
                        match[3] = test[3] - 0
                    }
                    match[0] = done++;
                    return match
                },
                ATTR: function (match, curLoop, inplace, result, not, isXML) {
                    var name = match[1].replace(/\\/g, "");
                    if (!isXML && Expr.attrMap[name]) {
                        match[1] = Expr.attrMap[name]
                    }
                    if (match[2] === "~=") {
                        match[4] = " " + match[4] + " "
                    }
                    return match
                },
                PSEUDO: function (match, curLoop, inplace, result, not) {
                    if (match[1] === "not") {
                        if ((chunker.exec(match[3]) || "").length > 1 || /^\w/.test(match[3])) {
                            match[3] = Sizzle(match[3], null, null, curLoop)
                        } else {
                            var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
                            if (!inplace) {
                                result.push.apply(result, ret)
                            }
                            return false
                        }
                    } else {
                        if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) {
                            return true
                        }
                    }
                    return match
                },
                POS: function (match) {
                    match.unshift(true);
                    return match
                }
            },
            filters: {
                enabled: function (elem) {
                    return elem.disabled === false && elem.type !== "hidden"
                },
                disabled: function (elem) {
                    return elem.disabled === true
                },
                checked: function (elem) {
                    return elem.checked === true
                },
                selected: function (elem) {
                    elem.parentNode.selectedIndex;
                    return elem.selected === true
                },
                parent: function (elem) {
                    return !!elem.firstChild
                },
                empty: function (elem) {
                    return !elem.firstChild
                },
                has: function (elem, i, match) {
                    return !!Sizzle(match[3], elem).length
                },
                header: function (elem) {
                    return /h\d/i.test(elem.nodeName)
                },
                text: function (elem) {
                    return "text" === elem.type
                },
                radio: function (elem) {
                    return "radio" === elem.type
                },
                checkbox: function (elem) {
                    return "checkbox" === elem.type
                },
                file: function (elem) {
                    return "file" === elem.type
                },
                password: function (elem) {
                    return "password" === elem.type
                },
                submit: function (elem) {
                    return "submit" === elem.type
                },
                image: function (elem) {
                    return "image" === elem.type
                },
                reset: function (elem) {
                    return "reset" === elem.type
                },
                button: function (elem) {
                    return "button" === elem.type || elem.nodeName.toLowerCase() === "button"
                },
                input: function (elem) {
                    return /input|select|textarea|button/i.test(elem.nodeName)
                }
            },
            setFilters: {
                first: function (elem, i) {
                    return i === 0
                },
                last: function (elem, i, match, array) {
                    return i === array.length - 1
                },
                even: function (elem, i) {
                    return i % 2 === 0
                },
                odd: function (elem, i) {
                    return i % 2 === 1
                },
                lt: function (elem, i, match) {
                    return i < match[3] - 0
                },
                gt: function (elem, i, match) {
                    return i > match[3] - 0
                },
                nth: function (elem, i, match) {
                    return match[3] - 0 === i
                },
                eq: function (elem, i, match) {
                    return match[3] - 0 === i
                }
            },
            filter: {
                PSEUDO: function (elem, match, i, array) {
                    var name = match[1],
                        filter = Expr.filters[name];
                    if (filter) {
                        return filter(elem, i, match, array)
                    } else {
                        if (name === "contains") {
                            return (elem.textContent || elem.innerText || getText([elem]) || "").indexOf(match[3]) >= 0
                        } else {
                            if (name === "not") {
                                var not = match[3];
                                for (var i = 0, l = not.length; i < l; i++) {
                                    if (not[i] === elem) {
                                        return false
                                    }
                                }
                                return true
                            } else {
                                throw "Syntax error, unrecognized expression: " + name
                            }
                        }
                    }
                },
                CHILD: function (elem, match) {
                    var type = match[1],
                        node = elem;
                    switch (type) {
                    case "only":
                    case "first":
                        while ((node = node.previousSibling)) {
                            if (node.nodeType === 1) {
                                return false
                            }
                        }
                        if (type === "first") {
                            return true
                        }
                        node = elem;
                    case "last":
                        while ((node = node.nextSibling)) {
                            if (node.nodeType === 1) {
                                return false
                            }
                        }
                        return true;
                    case "nth":
                        var first = match[2],
                            last = match[3];
                        if (first === 1 && last === 0) {
                            return true
                        }
                        var doneName = match[0],
                            parent = elem.parentNode;
                        if (parent && (parent.sizcache !== doneName || !elem.nodeIndex)) {
                            var count = 0;
                            for (node = parent.firstChild; node; node = node.nextSibling) {
                                if (node.nodeType === 1) {
                                    node.nodeIndex = ++count
                                }
                            }
                            parent.sizcache = doneName
                        }
                        var diff = elem.nodeIndex - last;
                        if (first === 0) {
                            return diff === 0
                        } else {
                            return (diff % first === 0 && diff / first >= 0)
                        }
                    }
                },
                ID: function (elem, match) {
                    return elem.nodeType === 1 && elem.getAttribute("id") === match
                },
                TAG: function (elem, match) {
                    return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match
                },
                CLASS: function (elem, match) {
                    return (" " + (elem.className || elem.getAttribute("class")) + " ").indexOf(match) > -1
                },
                ATTR: function (elem, match) {
                    var name = match[1],
                        result = Expr.attrHandle[name] ? Expr.attrHandle[name](elem) : elem[name] != null ? elem[name] : elem.getAttribute(name),
                        value = result + "",
                        type = match[2],
                        check = match[4];
                    return result == null ? type === "!=" : type === "=" ? value === check : type === "*=" ? value.indexOf(check) >= 0 : type === "~=" ? (" " + value + " ").indexOf(check) >= 0 : !check ? value && result !== false : type === "!=" ? value !== check : type === "^=" ? value.indexOf(check) === 0 : type === "$=" ? value.substr(value.length - check.length) === check : type === "|=" ? value === check || value.substr(0, check.length + 1) === check + "-" : false
                },
                POS: function (elem, match, i, array) {
                    var name = match[2],
                        filter = Expr.setFilters[name];
                    if (filter) {
                        return filter(elem, i, match, array)
                    }
                }
            }
        };
        var origPOS = Expr.match.POS;
        for (var type in Expr.match) {
            Expr.match[type] = new RegExp(Expr.match[type].source + /(?![^\[]*\])(?![^\(]*\))/.source);
            Expr.leftMatch[type] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[type].source)
        }
        var makeArray = function (array, results) {
                array = Array.prototype.slice.call(array, 0);
                if (results) {
                    results.push.apply(results, array);
                    return results
                }
                return array
            };
        try {
            Array.prototype.slice.call(document.documentElement.childNodes, 0)
        } catch (e) {
            makeArray = function (array, results) {
                var ret = results || [];
                if (toString.call(array) === "[object Array]") {
                    Array.prototype.push.apply(ret, array)
                } else {
                    if (typeof array.length === "number") {
                        for (var i = 0, l = array.length; i < l; i++) {
                            ret.push(array[i])
                        }
                    } else {
                        for (var i = 0; array[i]; i++) {
                            ret.push(array[i])
                        }
                    }
                }
                return ret
            }
        }
        var sortOrder;
        if (document.documentElement.compareDocumentPosition) {
            sortOrder = function (a, b) {
                if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                    if (a == b) {
                        hasDuplicate = true
                    }
                    return a.compareDocumentPosition ? -1 : 1
                }
                var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
                if (ret === 0) {
                    hasDuplicate = true
                }
                return ret
            }
        } else {
            if ("sourceIndex" in document.documentElement) {
                sortOrder = function (a, b) {
                    if (!a.sourceIndex || !b.sourceIndex) {
                        if (a == b) {
                            hasDuplicate = true
                        }
                        return a.sourceIndex ? -1 : 1
                    }
                    var ret = a.sourceIndex - b.sourceIndex;
                    if (ret === 0) {
                        hasDuplicate = true
                    }
                    return ret
                }
            } else {
                if (document.createRange) {
                    sortOrder = function (a, b) {
                        if (!a.ownerDocument || !b.ownerDocument) {
                            if (a == b) {
                                hasDuplicate = true
                            }
                            return a.ownerDocument ? -1 : 1
                        }
                        var aRange = a.ownerDocument.createRange(),
                            bRange = b.ownerDocument.createRange();
                        aRange.setStart(a, 0);
                        aRange.setEnd(a, 0);
                        bRange.setStart(b, 0);
                        bRange.setEnd(b, 0);
                        var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
                        if (ret === 0) {
                            hasDuplicate = true
                        }
                        return ret
                    }
                }
            }
        }
        function getText(elems) {
            var ret = "",
                elem;
            for (var i = 0; elems[i]; i++) {
                elem = elems[i];
                if (elem.nodeType === 3 || elem.nodeType === 4) {
                    ret += elem.nodeValue
                } else {
                    if (elem.nodeType !== 8) {
                        ret += getText(elem.childNodes)
                    }
                }
            }
            return ret
        }(function () {
            var form = document.createElement("div"),
                id = "script" + (new Date).getTime();
            form.innerHTML = "<a name='" + id + "'/>";
            var root = document.documentElement;
            root.insertBefore(form, root.firstChild);
            if (document.getElementById(id)) {
                Expr.find.ID = function (match, context, isXML) {
                    if (typeof context.getElementById !== "undefined" && !isXML) {
                        var m = context.getElementById(match[1]);
                        return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : []
                    }
                };
                Expr.filter.ID = function (elem, match) {
                    var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                    return elem.nodeType === 1 && node && node.nodeValue === match
                }
            }
            root.removeChild(form);
            root = form = null
        })();
        (function () {
            var div = document.createElement("div");
            div.appendChild(document.createComment(""));
            if (div.getElementsByTagName("*").length > 0) {
                Expr.find.TAG = function (match, context) {
                    var results = context.getElementsByTagName(match[1]);
                    if (match[1] === "*") {
                        var tmp = [];
                        for (var i = 0; results[i]; i++) {
                            if (results[i].nodeType === 1) {
                                tmp.push(results[i])
                            }
                        }
                        results = tmp
                    }
                    return results
                }
            }
            div.innerHTML = "<a href='#'></a>";
            if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" && div.firstChild.getAttribute("href") !== "#") {
                Expr.attrHandle.href = function (elem) {
                    return elem.getAttribute("href", 2)
                }
            }
            div = null
        })();
        if (document.querySelectorAll) {
            (function () {
                var oldSizzle = Sizzle,
                    div = document.createElement("div");
                div.innerHTML = "<p class='TEST'></p>";
                if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
                    return
                }
                Sizzle = function (query, context, extra, seed) {
                    context = context || document;
                    if (!seed && context.nodeType === 9 && !isXML(context)) {
                        try {
                            return makeArray(context.querySelectorAll(query), extra)
                        } catch (e) {}
                    }
                    return oldSizzle(query, context, extra, seed)
                };
                for (var prop in oldSizzle) {
                    Sizzle[prop] = oldSizzle[prop]
                }
                div = null
            })()
        }(function () {
            var div = document.createElement("div");
            div.innerHTML = "<div class='test e'></div><div class='test'></div>";
            if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) {
                return
            }
            div.lastChild.className = "e";
            if (div.getElementsByClassName("e").length === 1) {
                return
            }
            Expr.order.splice(1, 0, "CLASS");
            Expr.find.CLASS = function (match, context, isXML) {
                if (typeof context.getElementsByClassName !== "undefined" && !isXML) {
                    return context.getElementsByClassName(match[1])
                }
            };
            div = null
        })();

        function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
            for (var i = 0, l = checkSet.length; i < l; i++) {
                var elem = checkSet[i];
                if (elem) {
                    elem = elem[dir];
                    var match = false;
                    while (elem) {
                        if (elem.sizcache === doneName) {
                            match = checkSet[elem.sizset];
                            break
                        }
                        if (elem.nodeType === 1 && !isXML) {
                            elem.sizcache = doneName;
                            elem.sizset = i
                        }
                        if (elem.nodeName.toLowerCase() === cur) {
                            match = elem;
                            break
                        }
                        elem = elem[dir]
                    }
                    checkSet[i] = match
                }
            }
        }
        function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
            for (var i = 0, l = checkSet.length; i < l; i++) {
                var elem = checkSet[i];
                if (elem) {
                    elem = elem[dir];
                    var match = false;
                    while (elem) {
                        if (elem.sizcache === doneName) {
                            match = checkSet[elem.sizset];
                            break
                        }
                        if (elem.nodeType === 1) {
                            if (!isXML) {
                                elem.sizcache = doneName;
                                elem.sizset = i
                            }
                            if (typeof cur !== "string") {
                                if (elem === cur) {
                                    match = true;
                                    break
                                }
                            } else {
                                if (Sizzle.filter(cur, [elem]).length > 0) {
                                    match = elem;
                                    break
                                }
                            }
                        }
                        elem = elem[dir]
                    }
                    checkSet[i] = match
                }
            }
        }
        var contains = document.compareDocumentPosition ?
        function (a, b) {
            return a.compareDocumentPosition(b) & 16
        } : function (a, b) {
            return a !== b && (a.contains ? a.contains(b) : true)
        };
        var isXML = function (elem) {
                var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
                return documentElement ? documentElement.nodeName !== "HTML" : false
            };
        var posProcess = function (selector, context) {
                var tmpSet = [],
                    later = "",
                    match, root = context.nodeType ? [context] : context;
                while ((match = Expr.match.PSEUDO.exec(selector))) {
                    later += match[0];
                    selector = selector.replace(Expr.match.PSEUDO, "")
                }
                selector = Expr.relative[selector] ? selector + "*" : selector;
                for (var i = 0, l = root.length; i < l; i++) {
                    Sizzle(selector, root[i], tmpSet)
                }
                return Sizzle.filter(later, tmpSet)
            };
        return Sizzle
    })();
    /*
     * SWFObject v2.1 <http://code.google.com/p/swfobject/>
     * Copyright (c) 2007-2008 Geoff Stearns, Michael Williams, and Bobby van der Sluis
     * This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
     *
     * Modified for inclusion in Shadowbox.js
     */
    S.flash = (function () {
        var swfobject = function () {
                var UNDEF = "undefined",
                    OBJECT = "object",
                    SHOCKWAVE_FLASH = "Shockwave Flash",
                    SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
                    FLASH_MIME_TYPE = "application/x-shockwave-flash",
                    EXPRESS_INSTALL_ID = "SWFObjectExprInst",
                    win = window,
                    doc = document,
                    nav = navigator,
                    domLoadFnArr = [],
                    regObjArr = [],
                    objIdArr = [],
                    listenersArr = [],
                    script, timer = null,
                    storedAltContent = null,
                    storedAltContentId = null,
                    isDomLoaded = false,
                    isExpressInstallActive = false;
                var ua = function () {
                        var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
                            playerVersion = [0, 0, 0],
                            d = null;
                        if (typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
                            d = nav.plugins[SHOCKWAVE_FLASH].description;
                            if (d && !(typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) {
                                d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                                playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
                                playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                                playerVersion[2] = /r/.test(d) ? parseInt(d.replace(/^.*r(.*)$/, "$1"), 10) : 0
                            }
                        } else {
                            if (typeof win.ActiveXObject != UNDEF) {
                                var a = null,
                                    fp6Crash = false;
                                try {
                                    a = new ActiveXObject(SHOCKWAVE_FLASH_AX + ".7")
                                } catch (e) {
                                    try {
                                        a = new ActiveXObject(SHOCKWAVE_FLASH_AX + ".6");
                                        playerVersion = [6, 0, 21];
                                        a.AllowScriptAccess = "always"
                                    } catch (e) {
                                        if (playerVersion[0] == 6) {
                                            fp6Crash = true
                                        }
                                    }
                                    if (!fp6Crash) {
                                        try {
                                            a = new ActiveXObject(SHOCKWAVE_FLASH_AX)
                                        } catch (e) {}
                                    }
                                }
                                if (!fp6Crash && a) {
                                    try {
                                        d = a.GetVariable("$version");
                                        if (d) {
                                            d = d.split(" ")[1].split(",");
                                            playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)]
                                        }
                                    } catch (e) {}
                                }
                            }
                        }
                        var u = nav.userAgent.toLowerCase(),
                            p = nav.platform.toLowerCase(),
                            webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false,
                            ie = false,
                            windows = p ? /win/.test(p) : /win/.test(u),
                            mac = p ? /mac/.test(p) : /mac/.test(u);
/*@cc_on
			ie = true;
			@if (@_win32)
				windows = true;
			@elif (@_mac)
				mac = true;
			@end
		@*/
                        return {
                            w3cdom: w3cdom,
                            pv: playerVersion,
                            webkit: webkit,
                            ie: ie,
                            win: windows,
                            mac: mac
                        }
                    }();
                var onDomLoad = function () {
                        if (!ua.w3cdom) {
                            return
                        }
                        addDomLoadEvent(main);
                        if (ua.ie && ua.win) {
                            try {
                                doc.write("<script id=__ie_ondomload defer=true src=//:><\/script>");
                                script = getElementById("__ie_ondomload");
                                if (script) {
                                    addListener(script, "onreadystatechange", checkReadyState)
                                }
                            } catch (e) {}
                        }
                        if (ua.webkit && typeof doc.readyState != UNDEF) {
                            timer = setInterval(function () {
                                if (/loaded|complete/.test(doc.readyState)) {
                                    callDomLoadFunctions()
                                }
                            }, 10)
                        }
                        if (typeof doc.addEventListener != UNDEF) {
                            doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, null)
                        }
                        addLoadEvent(callDomLoadFunctions)
                    }();

                function checkReadyState() {
                    if (script.readyState == "complete") {
                        script.parentNode.removeChild(script);
                        callDomLoadFunctions()
                    }
                }
                function callDomLoadFunctions() {
                    if (isDomLoaded) {
                        return
                    }
                    if (ua.ie && ua.win) {
                        var s = createElement("span");
                        try {
                            var t = doc.getElementsByTagName("body")[0].appendChild(s);
                            t.parentNode.removeChild(t)
                        } catch (e) {
                            return
                        }
                    }
                    isDomLoaded = true;
                    if (timer) {
                        clearInterval(timer);
                        timer = null
                    }
                    var dl = domLoadFnArr.length;
                    for (var i = 0; i < dl; i++) {
                        domLoadFnArr[i]()
                    }
                }
                function addDomLoadEvent(fn) {
                    if (isDomLoaded) {
                        fn()
                    } else {
                        domLoadFnArr[domLoadFnArr.length] = fn
                    }
                }
                function addLoadEvent(fn) {
                    if (typeof win.addEventListener != UNDEF) {
                        win.addEventListener("load", fn, false)
                    } else {
                        if (typeof doc.addEventListener != UNDEF) {
                            doc.addEventListener("load", fn, false)
                        } else {
                            if (typeof win.attachEvent != UNDEF) {
                                addListener(win, "onload", fn)
                            } else {
                                if (typeof win.onload == "function") {
                                    var fnOld = win.onload;
                                    win.onload = function () {
                                        fnOld();
                                        fn()
                                    }
                                } else {
                                    win.onload = fn
                                }
                            }
                        }
                    }
                }
                function main() {
                    var rl = regObjArr.length;
                    for (var i = 0; i < rl; i++) {
                        var id = regObjArr[i].id;
                        if (ua.pv[0] > 0) {
                            var obj = getElementById(id);
                            if (obj) {
                                regObjArr[i].width = obj.getAttribute("width") ? obj.getAttribute("width") : "0";
                                regObjArr[i].height = obj.getAttribute("height") ? obj.getAttribute("height") : "0";
                                if (hasPlayerVersion(regObjArr[i].swfVersion)) {
                                    if (ua.webkit && ua.webkit < 312) {
                                        fixParams(obj)
                                    }
                                    setVisibility(id, true)
                                } else {
                                    if (regObjArr[i].expressInstall && !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac)) {
                                        showExpressInstall(regObjArr[i])
                                    } else {
                                        displayAltContent(obj)
                                    }
                                }
                            }
                        } else {
                            setVisibility(id, true)
                        }
                    }
                }
                function fixParams(obj) {
                    var nestedObj = obj.getElementsByTagName(OBJECT)[0];
                    if (nestedObj) {
                        var e = createElement("embed"),
                            a = nestedObj.attributes;
                        if (a) {
                            var al = a.length;
                            for (var i = 0; i < al; i++) {
                                if (a[i].nodeName == "DATA") {
                                    e.setAttribute("src", a[i].nodeValue)
                                } else {
                                    e.setAttribute(a[i].nodeName, a[i].nodeValue)
                                }
                            }
                        }
                        var c = nestedObj.childNodes;
                        if (c) {
                            var cl = c.length;
                            for (var j = 0; j < cl; j++) {
                                if (c[j].nodeType == 1 && c[j].nodeName == "PARAM") {
                                    e.setAttribute(c[j].getAttribute("name"), c[j].getAttribute("value"))
                                }
                            }
                        }
                        obj.parentNode.replaceChild(e, obj)
                    }
                }
                function showExpressInstall(regObj) {
                    isExpressInstallActive = true;
                    var obj = getElementById(regObj.id);
                    if (obj) {
                        if (regObj.altContentId) {
                            var ac = getElementById(regObj.altContentId);
                            if (ac) {
                                storedAltContent = ac;
                                storedAltContentId = regObj.altContentId
                            }
                        } else {
                            storedAltContent = abstractAltContent(obj)
                        }
                        if (!(/%$/.test(regObj.width)) && parseInt(regObj.width, 10) < 310) {
                            regObj.width = "310"
                        }
                        if (!(/%$/.test(regObj.height)) && parseInt(regObj.height, 10) < 137) {
                            regObj.height = "137"
                        }
                        doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
                        var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn",
                            dt = doc.title,
                            fv = "MMredirectURL=" + win.location + "&MMplayerType=" + pt + "&MMdoctitle=" + dt,
                            replaceId = regObj.id;
                        if (ua.ie && ua.win && obj.readyState != 4) {
                            var newObj = createElement("div");
                            replaceId += "SWFObjectNew";
                            newObj.setAttribute("id", replaceId);
                            obj.parentNode.insertBefore(newObj, obj);
                            obj.style.display = "none";
                            var fn = function () {
                                    obj.parentNode.removeChild(obj)
                                };
                            addListener(win, "onload", fn)
                        }
                        createSWF({
                            data: regObj.expressInstall,
                            id: EXPRESS_INSTALL_ID,
                            width: regObj.width,
                            hei