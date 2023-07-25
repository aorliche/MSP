<?php
    header('Content-Type: application/json; charset=utf-8');

	//$mysqli = new mysqli('localhost', 'calmprep_anton', 'MySQL1@bbb', 'calmprep_hunimal');
    //$mysqli = new mysqli('localhost', 'anton', 'AtlanticCityPass', 'hunimal');
    $mysqli = new mysqli('localhost', 'aorliche', 'AtlanticCityPass', 'hunimal');
    
    $stmt = $mysqli->prepare("select name,json from publish_books");
    $success = $stmt->execute();

    if (!$success) {
        echo json_encode(array('error' => $stmt->error));
        exit();
    }

    $result = $stmt->get_result();
    $json_results = array();

    while ($row = $result->fetch_assoc()) {
        array_push($json_results, array('name' => $row['name'], 'json' => json_decode($row['json'])));
    }

    $mysqli->close();

    echo json_encode($json_results);
?>
