<?php

@session_start();

$a=explode('wp-content',$_SERVER['SCRIPT_FILENAME']);

 

  $path=$a[0];



include_once $path . '/wp-config.php';

include_once $path . '/wp-load.php';

include_once $path . '/wp-includes/wp-db.php';

include_once $path . '/wp-includes/pluggable.php';

global $wpdb;

$linkbase_table_prefix1=$wpdb->prefix.'linkbase_';

define('LINKBASE_TABLE_PREFIX', $linkbase_table_prefix);

define('LINKBASE_TABLE_PREFIX1', $linkbase_table_prefix1);



//print_r($_SESSION['like_status']);

	if($_SESSION['like_status'] == '') {

		$_SESSION['like_status'] = array();

	}

	$array = $_SESSION['like_status'];

	

	$id = $_POST['likeid'];

	$like = $_POST['like'];

	if (!in_array($id, $array)) {

           // echo "abc";

		echo $like=$_POST['like']+1;

		

		$table = LINKBASE_TABLE_PREFIX1."linkbase";

		$sql="update $table SET likeup=$like where id=$id";

		$wpdb->query($sql);

		

		array_push($array, $id);

		$_SESSION['like_status']=$array;

		exit;

	} else {

		$tablel = LINKBASE_TABLE_PREFIX1."linkbase";

		$sqll="SELECT * FROM $tablel WHERE id=$id";

		$results = $wpdb->get_results($sqll);

		foreach($results as $row)

	    {

			//echo "abch";

                    echo $row->likeup;

			exit;

		}

	} 













?>

