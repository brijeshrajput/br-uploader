<?php
//POST Request

include_once('asset.php');

// dd($_POST['id']);

$id = $_POST['id'];

foreach ($id as $key => $value) {
    $q = "DELETE FROM uploads WHERE id = $value";
    if (mysqli_query($sqlConnect, $q)) {
        // header('Location: ' . $_SERVER['HTTP_REFERER']);
    } else {
        echo "Error deleting record: " . mysqli_error($sqlConnect);
    }
}

echo 1;

?>