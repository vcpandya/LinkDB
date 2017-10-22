<?php ob_start();@session_start();
$siteurl = get_option('siteurl');
$t=time();
global $wpdb;
define('LINKBASE_FOLDER', dirname(plugin_basename(__FILE__)));
define('LINKBASE_URL', $siteurl.'/wp-content/plugins/' . LINKBASE_FOLDER);
define('LINKBASE_FILE_PATH', dirname(__FILE__));
define('LINKBASE_DIR_NAME', basename(LINKBASE_FILE_PATH));
$linkbase_table_prefix=$wpdb->prefix.'linkbase_';
define('LINKBASE_TABLE_PREFIX', $linkbase_table_prefix);
?>
<link type="text/css" rel="stylesheet" href="http://cwo.ucsd.edu/_resources/shadowbox/shadowbox-3.0.3/shadowbox.css" />
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
<script type="text/javascript"> 
var options = { 
      
       ext:     { 
            img:        ['png', 'jpg', 'jpeg', 'gif', 'bmp'], 
            swf:        ['swf'], 
            flv:        ['flv', 'mp3'], 
            qt:         ['dv', 'mov', 'moov', 'movie', 'mp4'], 
            wmp:        ['asf', 'wm', 'wmv'], 
            qtwmp:      ['avi', 'mpg', 'mpeg'], 
            iframe:     ['asp', 'aspx', 'cgi', 'cfm', 'htm', 'html', 'pl', 'php', 
                        'php3', 'php4', 'php5', 'phtml', 'rb', 'rhtml', 'shtml', 
                        'txt', 'vbs'] 
        } 
    }; 
    Shadowbox.init(options); 
</script>

<script type="text/javascript" >



jQuery(document).ready(function() {  
    jQuery('#submitlink<?php echo $t.$table_id;?>').click(function() {   

                    //alert("hii");
                
			var regUrl = /^(((ht|f){1}(tp:[/][/]){1})|((www.){1}))[-a-zA-Z0-9@:%_\+.~#?&//=]+$/;
                        var url0=window.location;
			var link1 = jQuery("#link<?php echo $t.$table_id;?>").val();
			var desc =jQuery("#desc<?php echo $t.$table_id;?>").val();
			var table_id = jQuery("#table_id<?php echo $t.$table_id;?>").val();
			var userid = jQuery("#userid<?php echo $t.$table_id;?>").val();
			var dataString = 'link='+ link1 + '&desc=' + desc  + '&table_id='+ table_id +'&userid='+userid;
				   // alert(dataString);
			 if(link1=='')
			{
			alert("Please Enter link.You can't left it blank");
					
					
			}else  if(regUrl.test(link1) == false){

						alert("Invalid url format, please make sure your link begins with http:// ");

                        }else if(desc==''){
				alert("Please Enter Description.You can't left it blank");
			}else if(regUrl.test(link1) == true && desc!=''){
				
				jQuery.ajax({
				type: "POST",
				url: "<?php echo $siteurl;?>/wp-content/plugins/linkbase/join.php",
				data: dataString,
				success: function(msg){
					//alert(msg);
					alert("Thank You For Submitting");
                                        window.location.replace(url0);
					//jQuery(".sucess<?php echo $t.$table_id;?>").show();
					//return msg;
				}
				});
			}
			return false;
		});
       	
	});


	<?php
	global $wpdb;
 $sqlvote = "SELECT * FROM ".$wpdb->prefix."vote WHERE vote=1";
 $rests = $wpdb->get_results($sqlvote);

 $my_ip = getenv("REMOTE_ADDR");
 $ipvote = "SELECT * FROM ".$wpdb->prefix."ip WHERE ip='$my_ip'";
 $ipsts = $wpdb->get_results($ipvote);
 
 $user_id = get_current_user_id();
 $vote = "SELECT * FROM ".$wpdb->prefix."users WHERE ID='$user_id'";
 $sts = $wpdb->get_results($vote);
 
 $vote1 = "SELECT * FROM ".$wpdb->prefix."users WHERE ID='$user_id' AND ban=1";
 $stsw = $wpdb->get_results($vote1);
        
?> 
      
 function thup(id) {
  //alert(id);
  var likeup = $('#likeup'+id).val();
  var dataString = 'like='+ likeup + '&likeid='+id;
  <?php 
  if(count($rests) > 0)
  {
    
   foreach($rests as $ro)
   {
     $vot = $ro->id;
    /* Check Register user voting */
    if($vot != '1') 
    {
     /*Check IP voting*/
     if(count($ipsts) > 0)
     {
      ?>alert("Your IP is Banned For This Voting. So You can not Vote."); exit();<?php
     } else {
      if(count($sts) > 0)
      { 
       if(count($stsw) > 0)
       { 
        ?>alert("This User is Banned For Voting. So You can not Vote."); exit();<?php
       } else { ?>
        //alert(dataString);
        $.ajax({
         type: "POST",
         url: "<?php echo $siteurl;?>/wp-content/plugins/linkbase/count.php",
         data: dataString,
         success: function(msg){
          //alert(msg);
          $('#thumbup1'+id).html(msg);
         }
        });
     <?php  }
      } else {  ?>
       alert("Only Register User can vote.");
     <?php
      }
     }
    } else {
     ?>
        // alert("hi");
     $.ajax({
      type: "POST",
      url: "<?php echo $siteurl;?>/wp-content/plugins/linkbase/count.php",
      data: dataString,
      success: function(msg){
       //alert(msg);
       $('#thumbup1'+id).html(msg);
      }
     });

     <?php
    }
   } 
  } else { ?>
   
<?php } ?>
 }
 function thdown(id) {
  //alert(id);
  var unlike = $("#likedown"+id).val();
  var dataString = 'unlike='+ unlike + '&unlikeid='+id;

  <?php 
  if(count($rests) > 0)
  {
   foreach($rests as $ro)
   {
    $vot = $ro->id;
    /* Check Register user voting */
    if($vot != '1') 
    {
     /*Check IP voting*/
     if(count($ipsts) > 0)
     {
      ?>alert("Your IP is Banned For This Voting. So You can not Vote."); exit();<?php
     } else {
      if(count($sts) > 0)
      { 
       if(count($stsw) > 0)
       { 
        ?>alert("This User is Banned For Voting. So You can not Vote."); exit();<?php
       } else { ?>
   
       //alert(dataString);
       $.ajax({
        type: "POST",
        url: "<?php echo $siteurl;?>/wp-content/plugins/linkbase/count1.php",
        data: dataString,
        success: function(msg){
         //alert(msg);
         $('#thumbdown1'+id).html(msg);
        }
       });
     <?php  }
      } else {  ?>
       alert("Only Register User can vote.");
     <?php
      }
     }
    } else {
     ?>
     $.ajax({
      type: "POST",
      url: "<?php echo $siteurl;?>/wp-content/plugins/linkbase/count1.php",
      data: dataString,
      success: function(msg){
       //alert(msg);
       $('#thumbdown1'+id).html(msg);
      }
     });

     <?php
    }
   } 
  } else { ?>
   
<?php } ?>
 }

</script>

<script>
function callmyform<?php echo $t.$table_id;?>()
{
 var ele = document.getElementById("linkform<?php echo $t.$table_id;?>");
    
    if(ele.style.display == "block") {
            ele.style.display = "none";
      }
    else {
        ele.style.display = "block";
        
    }
}
function openinfo(id)
{
 var ele = document.getElementById("showdescarea"+id);
  var ele1 = document.getElementById("info"+id);
    if(ele.style.display == "block") {
            ele.style.display = "none";
             ele1.innerHTML="More Details";
      }
    else {
        ele.style.display = "block";
        ele1.innerHTML="Hide Details";
    }
}



</script>
<?php
global $wpdb;

$rql = "SELECT * FROM ".LINKBASE_TABLE_PREFIX."table WHERE id=$table_id";
$wesults = $wpdb->get_results($rql);
$tbl_heading = $wesults[0]->table_heading;
if(count($wesults) > 0)
{
	
$sql = "SELECT l.id,l.link,l.description,l.likeup,l.unlike,t.table_heading,t.color FROM ".LINKBASE_TABLE_PREFIX."linkbase as l join ".LINKBASE_TABLE_PREFIX."table as t on l.table_id=t.id and l.table_id=$table_id WHERE l.approved =1 ORDER BY l.likeup DESC ";
$results = $wpdb->get_results($sql);
$table_heading = $results[0]->table_heading;

	 $url_img = plugins_url();
?>
<div class="linkbaseplg">
	<span class="success<?php echo $t.$table_id;?>" style="display:none;color:red;">Thank You For Submitting.</span>
	<div class="hding"><?php echo $tbl_heading; ?> 
	
	<!-- sandeep code here-->
			<div class="fb1">
			<a href="https://www.facebook.com/sharer/sharer.php?s=100&p[title]=<?php echo $blog_title = get_bloginfo(); ?>   | <?php echo $tbl_heading; ?>&p[summary]=<?php echo $tbl_heading; ?>&p[url]=<?php echo $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"] ?>&p[images][0]=<?php echo $url = plugins_url(); ?>/linkbase/images/nyar3.png" target="_blank"><img alt="Facebook" title="Facebook" src="<?php echo $url_img."/linkbase/fblk.png"?>" width="28px" style="box-shadow: none;"/></a>
			<g:plusone></g:plusone>
			<a href="https://plus.google.com/share?url=<?php echo $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"] ?> " target="_blank" >
			<img src="<?php echo $url_img; ?>/linkbase/heart.png" width="28px" alt="Google+" title="Google+" style="box-shadow: none;
"/>
			</a>
			</div>
	<!--end sandeep code-->
	
	<?php //echo do_shortcode("[]"); ?></div>
	<div class="head"><img src="<?php echo $url_img."/linkbase/link.png"?>" class="img_link"><a onclick="callmyform<?php echo $t.$table_id;?>()">Add a New Link to the LinkBase</a></div>
	<div class="linkform" id="linkform<?php echo $t.$table_id;?>" style="display:none;">
		<form method="post" name="form">
			<div class="text"><label for='name' >LINK*: </label>
				<input type="url" name='link' id='link<?php echo $t.$table_id;?>' class='linkcl' /><input type='hidden' name='userid' id='userid<?php echo $t.$table_id;?>' value="<?php echo $user_id = get_current_user_id(); ?>" />
				<div class="rong" style="display:none;margin-left: 120px;">Please Enter valid URL</div>
			</div>
			<div class="text">
				<label for='email' >DESCRIPTION*:</label>
				<textarea name="desc" id="desc<?php echo $t.$table_id;?>" rows="4" cols="37"></textarea>
			</div>
                    <input type="hidden" id="table_id<?php echo $t.$table_id;?>" value="<?php echo $table_id;?>"/>
			<input id="submitlink<?php echo $t.$table_id;?>"   class="inpsub" href="#" type="submit" style="padding: 1px 10px 3px; font-size: 29px ! important; " value="Add" name="Submit">

		</form>

	</div>


	<div class="showingarea">
	    <?php 
	    
	    foreach($results as $row)
	    {
			
			?>
            
		<div class="showsuccess" id="showsuccess">
		    <input type="hidden" class="id" id="id" value="<?php echo $row->id;?>"/>
		    <div class="arealeft">
		 <?php if($row->color=='FFFFFF'){ ?>
            <div class="showlinkarea" style="background-color: #C9DAEE !important;">
                             
                              <?php }else{ ?>
				<div class="showlinkarea" style="background-color:#<?php echo $row->color;?> !important;">
                                <?php } ?>
					<div style="width:310px;float:right;">
	<?php 
		$location = $row->link;
		$you = explode("http", $location);
		$youhttp = $you[0];
		
		$youw = explode("www", $location);
		$youwww = $youw[0];
		
		$piece = explode("//", $location);
		$http = $piece[0];
		$pieces = explode(".", $location);
		$www = $pieces[0]; ?>
		
<?php	if(isset($youhttp) || isset($youwww))
	{
		//if(preg_match("/^(?:http(?:s)?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?v(?:i)?=|(?:embed|v|vi|user)\/))([^\?&\"'>]+)/", $location, $vresult)) {
		
		if (strpos($location,'youtube') !== false) {
			parse_str( parse_url( $location, PHP_URL_QUERY ), $my_array_of_vars );
			$val = $my_array_of_vars['v']; 
			
			if($val != null) {
			?>
			<!--<a class="test" href="http://www.youtube.com/v/QJK1x4KekZw&rel=1" rel="shadowbox;width=640;height=480" title="<?php echo $row->link;?>."><?php echo $row->link;?></a>-->
			<a class="test" href="http://www.youtube.com/v/<?php echo $val; ?>&rel=1" rel="shadowbox;width=640;height=480" title="http://www.youtube.com/v/<?php echo $val; ?>&rel=1"><?php echo $location;?></a>
<?php		} else { ?>
				<a href="<?php echo $location;?>" title="<?php echo $location;?>" rel="shadowbox;width=640;height=480"><?php echo $location;?></a>
<?php		}
			
		} else { ?>
			
			<?php	if($http != 'http:') { ?>
						<a href="<?php echo "http://".$location; ?>" target="blank" ><?php echo $location; ?></a>
			<?php	} else { ?>
						<a href="<?php echo $location; ?>" target="blank" ><?php echo $location; ?></a>
			<?php	}	?>
			
<?php	} 
	} ?>
					</div>
					<div style="width:101px;float:left;"><?php echo do_shortcode('[browsershot url="'.$row->link.'" width="100px"]'); ?></div>
			    </div>
					
			   
				
				
				<a onclick="openinfo(<?php echo $row->id;?>)" id="info<?php echo $row->id;?>"  style="display:block;">More Details</a>
                                <?php if($row->color=='FFFFFF'){
                                    ?>
                                <div class="showdescarea" id="showdescarea<?php echo $row->id;?>" style="display:none;background-color: #C9DAEE !important;"><?php echo $row->description;?></div>
                              <?php }else{?>
				<div class="showdescarea" id="showdescarea<?php echo $row->id;?>" style="display:none;background-color: #<?php echo $row->color;?> !important;"><?php echo $row->description;?></div>
                                <?php } ?>
		    </div>
		    <div class="arearight">
				<div style="float: left;height: 40px;margin: 24px 1px 0 0;width: 40px;"><a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $row->link;?>" target="_blank"><img src="<?php echo $url_img."/linkbase/fblk.png"?>" width="39px" style="box-shadow: none;" alt="Facebook" title="Facebook" /></a></div>
				<div style="float: left; width: 42px; height: 85px; text-align: center;">
					<div class="thumbup" id="thumbup<?php echo $row->id;?>" onclick="thup(<?php echo $row->id;?>)"></div>
					<span id="thumbup1<?php echo $row->id;?>"><?php echo $row->likeup;?></span>
					<input type="hidden" id="likeup<?php echo $row->id;?>" value="<?php echo $row->likeup;?>" />
				</div>
				
				<div style="float: left; width: 42px; height: 85px; text-align: center;margin-left: 5px;">
					<div class="thumbdown" id="thumbdown<?php echo $row->id;?>" onclick="thdown(<?php echo $row->id;?>)"></div>
					<span id="thumbdown1<?php echo $row->id;?>"><?php echo $row->unlike;?></span>
					<input type="hidden" id="likedown<?php echo $row->id;?>" value="<?php echo $row->unlike;?>" />
				</div>
				<div id="colorSelector" style="clear:both;">
					<div style="background-color: #0000ff"></div>
				</div>
				
				<div id="color"></div>
		    </div>
		</div>

      <?php } ?>
	</div>
</div>
<?php 
} else {

?>
<div class="linkbaseplg">
	<div class="hding">Sorry No Record Found</div>
	
	<?php 
} ?>
