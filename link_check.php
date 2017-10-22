<?php
$a=explode('wp-content',$_SERVER['SCRIPT_FILENAME']);
 
  $path=$a[0];
include_once $path . '/wp-config.php';
include_once $path . '/wp-load.php';
include_once $path . '/wp-includes/wp-db.php';
include_once $path . '/wp-includes/pluggable.php';

global $wpdb;
$linkbase_table_prefix1=$wpdb->prefix.'linkbase_';

define('LINKBASE_TABLE_PREFIX1', $linkbase_table_prefix1);


$id = $_GET['id'];
$sql = "SELECT * FROM ".LINKBASE_TABLE_PREFIX."linkbase WHERE table_id=$id ORDER BY id asc";
$results = $wpdb->get_results($sql);
if(count($results) > 0)
{
	//print_r($results);
	foreach($results as $result)
	{
		//print_r($results);
		$rcom[] = $result;
		
	}
	echo json_encode($rcom);
} else {
	echo "No Record Found";
}
//$row = mysql_fetch_object($result);

/*if(mysql_num_rows($result)>0)
{
	 while($row_com = mysql_fetch_object($result)) {
		$tribes=$row_com->tribes;
		$category=$row_com->category;
		$sql1 = "SELECT GROUP_CONCAT(Name) as tname FROM wp_tribe_master WHERE TribeMasterID IN (".$tribes.")";
		$result1 = mysql_query($sql1);
		$row_com1 = mysql_fetch_object($result1);
		$row_com->test=$row_com1->tname;
		
		$sql1 = "SELECT GROUP_CONCAT(name) as cname FROM wp_terms WHERE term_id IN (".$category.")";
		$result1 = mysql_query($sql1);
		$row_com1 = mysql_fetch_object($result1);
		$row_com->catname=$row_com1->cname;
		
		
		$rcom[] = $row_com;
		 //json_encode($row_com);
	}
	echo json_encode($rcom);
	//print_r($rcom);
} else {
	echo "No Record Found";
}
*/
