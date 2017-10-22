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

//$result = $_REQUEST['id'];
if($_REQUEST['id']!='0') {
	if($_REQUEST['id']=='1') { //Approve All User
		echo $sqip="UPDATE ".LINKBASE_TABLE_PREFIX."linkbase SET approved = '1',denied=0";
		$wpdb->query($sqip);
		echo "All approved";
	} elseif($_REQUEST['id']=='2') { //Approve only Unregister user
		global $wpdb;
		$sql = "SELECT * FROM ".LINKBASE_TABLE_PREFIX."linkbase WHERE userid = '0'";
		$results = $wpdb->get_results($sql);
		if(count($results) > 0)
		{
			foreach($results as $result)
			{ 
				$sqip="UPDATE ".LINKBASE_TABLE_PREFIX."linkbase SET approved = '1',denied=0 WHERE id = '".$result->id."'";
				$wpdb->query($sqip);
			}
			echo "All Unregister user approved";
			
						
			
		}
                $sl = "SELECT * FROM ".LINKBASE_TABLE_PREFIX."approvelinks WHERE sltd = '1'";
			$results = $wpdb->get_results($sl);
			foreach($results as $result)
			{ 
				 $sqip="UPDATE ".LINKBASE_TABLE_PREFIX."approvelinks SET sltd = '0' WHERE id = '".$result->id."'";
				$wpdb->query($sqip);
			}
			 $sqi="UPDATE ".LINKBASE_TABLE_PREFIX."approvelinks SET sltd = '1' WHERE id = '".$_REQUEST['id']."'";
			$wpdb->query($sqi);
			
	} elseif($_REQUEST['id']=='3') { //Auto Approve
		$sqip="UPDATE ".LINKBASE_TABLE_PREFIX."linkbase SET approved = '1',denied=0";
		$wpdb->query($sqip);
                 $sl = "SELECT * FROM ".LINKBASE_TABLE_PREFIX."approvelinks WHERE sltd = '1'";
			$results = $wpdb->get_results($sl);
			foreach($results as $result)
			{ 
				 $sqip="UPDATE ".LINKBASE_TABLE_PREFIX."approvelinks SET sltd = '0' WHERE id = '".$result->id."'";
				$wpdb->query($sqip);
			}
                $sqip1="UPDATE ".LINKBASE_TABLE_PREFIX."approvelinks SET sltd = '1' WHERE id = '".$_REQUEST['id']."'";
		$wpdb->query($sqip1);
		echo "Auto Approve All links";
	} 
}
/*
	global $wpdb;
	$sql = "SELECT *FROM ".LINKBASE_TABLE_PREFIX."linkbase WHERE approved = '0'";
	$results = $wpdb->get_results($sql);
	if(count($results) > 0)
	{
		foreach($results as $result)
		{ 
			$sqip="UPDATE ".LINKBASE_TABLE_PREFIX."linkbase SET approved = '1'";
			$wpdb->query($sqip);
		}
	}

*/
