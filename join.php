<?php

 //$path = $_SERVER['DOCUMENT_ROOT'];
 $a=explode('wp-content',$_SERVER['SCRIPT_FILENAME']);
 
 echo $path=$a[0];
 
include_once $path . '/wp-config.php';
include_once $path . '/wp-load.php';
include_once $path . '/wp-includes/wp-db.php';
include_once $path . '/wp-includes/pluggable.php';

global $wpdb;
 $linkbase_table_prefix1=$wpdb->prefix.'linkbase_';
define('LINKBASE_TABLE_PREFIX1', $linkbase_table_prefix1);
 $link=$_POST['link'];
 $desc=$_POST['desc'];
 $table_id=$_POST['table_id'];
 $userid=$_POST['userid'];


//print_r($_POST);	
 $table = LINKBASE_TABLE_PREFIX1."linkbase";

 $aplink = "SELECT * FROM ".LINKBASE_TABLE_PREFIX1."approvelinks WHERE sltd='1'";
$stss = $wpdb->get_results($aplink);
//print_r($stss);

foreach($stss as $row) {
	//print_r($row);
	 $id = $row->id;
	if($id == 2) {
            //only unregistered user
		if($userid >0) {
			$sql21="INSERT INTO $table (link, description,table_id,userid,approved,denied) VALUES('$link','$desc','$table_id','1','1','0')";
			$wpdb->query($sql21);
			exit(0);
		} else {
			 $sql20="INSERT INTO $table (link, description,table_id,userid,approved,denied) VALUES('$link','$desc','$table_id','0','0','1')";
			$wpdb->query($sql20);
			exit(0);
		}
	} elseif($id == 3) {
		//auto approval
		if($userid >0) {
			
			 $sql31="INSERT INTO $table (link, description,table_id,userid,approved,denied) VALUES('$link','$desc','$table_id','1','1','0')";
			$wpdb->query($sql31);exit;
		} else {
                         $sql30="INSERT INTO $table (link, description,table_id,userid,approved,denied) VALUES('$link','$desc','$table_id','0','1','0')";
			$wpdb->query($sql30);exit;
		}
	} elseif($id == 1) {
		 //moderate all user
		if($userid >0) {
	
			echo $sqla1="INSERT INTO $table (link, description,table_id,userid,approved,denied) VALUES('$link','$desc','$table_id','1','0','1')";
			$wpdb->query($sqla1);exit;
		} else {
			$sqla0="INSERT INTO $table (link, description,table_id,userid,approved,denied) VALUES('$link','$desc','$table_id','0','0','1')";
			$wpdb->query($sqla0);exit;
		}
	}
} 
exit;


?>

