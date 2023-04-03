<?php
// Simple

include_once('asset.php');
include_once('helper.php');


$q = "SELECT * FROM uploads WHERE user_id = 0";
if (isset($_GET['search'])) {
    $q .= " AND file_original_name LIKE '%" . $_GET['search'] . "%'";
}
if (isset($_GET['sort'])) {
    switch ($_GET['sort']) {
        case 'newest':
            $q .= " ORDER BY created_at DESC";
            break;
        case 'oldest':
            $q .= " ORDER BY created_at ASC";
            break;
        case 'smallest':
            $q .= " ORDER BY file_size ASC";
            break;
        case 'largest':
            $q .= " ORDER BY file_size DESC";
            break;
        default:
            $q .= " ORDER BY created_at DESC";
            break;
    }
}

$result = mysqli_query($sqlConnect, $q);

//Pagination
$per_page = 15;
$page = 1;
if (isset($_GET['page'])) {
    $page = $_GET['page'];
}
$offset = ($page - 1) * $per_page;
$total = mysqli_num_rows($result);
$total_pages = ceil($total / $per_page);
$q .= " LIMIT $offset, $per_page";
$result = mysqli_query($sqlConnect, $q);


$application = new Application();

if (mysqli_num_rows($result) > 0) {
    // output data of each row
    while($row = mysqli_fetch_assoc($result)) {
        $upload = new Data();
        $upload->file_original_name = $row['file_original_name'];
        $upload->extension = $row['extension'];
        $upload->file_name = $row['file_name'];
        $upload->user_id = $row['user_id'];
        $upload->type = $row['type'];
        $upload->file_size = $row['file_size'];
        $upload->created_at = $row['created_at'];
        $upload->updated_at = $row['updated_at'];
        $upload->id = (int) $row['id'];
        $upload->external_link = $row['external_link'];

        $application->data[] = $upload;
    }
}

$application->current_page = $page;
$application->first_page_url = "http://localhost/exp/aiz-uploader/get_uploaded_files.php?page=1";
$application->from = 1;
$application->last_page = $total_pages;
$application->last_page_url = "http://localhost/exp/aiz-uploader/get_uploaded_files.php?page=" . $total_pages;
if($page < $total_pages) {
    $application->next_page_url = "http://localhost/exp/aiz-uploader/get_uploaded_files.php?page=" . ($page + 1);
}
// $application->next_page_url = "http://localhost/exp/aiz-uploader/get_uploaded_files.php?page=" . ($page + 1);
$application->path = "http://localhost/exp/aiz-uploader/get_uploaded_files.php";
$application->per_page = $per_page;
if($page > 1) {
    $application->prev_page_url = "http://localhost/exp/aiz-uploader/get_uploaded_files.php?page=" . ($page - 1);
}
// $application->prev_page_url = "http://localhost/exp/aiz-uploader/get_uploaded_files.php?page=" . ($page - 1);
$application->to = $per_page;
$application->total = $total;

$links = new Links();



// dd($application);


?>