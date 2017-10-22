<?php ob_start();@session_start();




$a=explode('wp-content',$_SERVER['SCRIPT_FILENAME']);



 



  $path=$a[0];

include_once $path . '/wp-config.php';



include_once $path . '/wp-load.php';



include_once $path . '/wp-includes/wp-db.php';



include_once $path . '/wp-includes/pluggable.php';

global $wpdb;
$linkbase_table_prefix1=$wpdb->prefix.'linkbase_';
define('LINKBASE_TABLE_PREFIX1', $linkbase_table_prefix1);


	if($_SESSION['unlike_status'] == '') {
		$_SESSION['unlike_status'] = array();
	}

	$array1 = $_SESSION['unlike_status'];

	$id = $_POST['unlikeid'];
	$unlike = $_POST['unlike'];
	if (!in_array($id, $array1)) {
		echo $unlike=$_POST['unlike']+1;
		
		$table = LINKBASE_TABLE_PREFIX1."linkbase";
		$sql="update $table SET unlike=$unlike where id=$id";
		$wpdb->query($sql);
		
		array_push($array1, $id);
		$_SESSION['unlike_status']=$array1;
		exit;	
	} else {
		$tablel = LINKBASE_TABLE_PREFIX1."linkbase";
		$sqll="SELECT * FROM $tablel WHERE id=$id";
		$results = $wpdb->get_results($sqll);
		foreach($results as $row)
	    {
			echo $row->unlike;
			exit;
		}
	}






