<?php
// any but POST

include_once('asset.php');
include_once('helper.php');

$id = 0;
if(isset($_GET['id'])) {
    $id = $_GET['id'];
} elseif (isset($_POST['id'])) {
    $id = $_POST['id'];
}

$q = "SELECT * FROM uploads WHERE id = $id";

$file_ = mysqli_query($sqlConnect, $q);
$data = new Data();
if (mysqli_num_rows($file_) > 0) {
    // output data of each row
    $row = mysqli_fetch_assoc($file_);
    
    $data->id = (int)$row['id'];
    $data->file_original_name = $row['file_original_name'];
    $data->file_name = $row['file_name'];;
    $data->user_id = $row['user_id'];
    $data->file_size = $row['file_size'];
    $data->extension = $row['extension'];
    $data->type = $row['type'];
    if ($row['external_link'] != null) {
        $data->external_link = $row['external_link'];
    }
    $data->created_at = $row['created_at'];
    $data->updated_at = $row['updated_at'];
    $data->deleted_at = $row['deleted_at'];
    
}

// dd($data);
$file = $data;

include_once('file_info_model.php');

echo infomodel();


?>