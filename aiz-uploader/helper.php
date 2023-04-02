<?php
class Data {
 public $id; //int
 public $file_original_name; //String
 public $file_name; //String
 public $user_id; //int
 public $file_size; //int
 public $extension; //String
 public $type; //String
 public $external_link; //array( undefined )
 public $created_at; //Date
 public $updated_at; //Date
 public $deleted_at; //array( undefined )

}
class Links {
 public $url; //array( undefined )
 public $label; //String
 public $active; //boolean 

}
class Application {
 public $current_page; //int
 public $data; //array( Data )
 public $first_page_url; //Date
 public $from; //int
 public $last_page; //int
 public $last_page_url; //Date
 public $links; //array( Links )
 public $next_page_url; //array( object )
 public $path; //String
 public $per_page; //int
 public $prev_page_url; //array( object )
 public $to; //int
 public $total; //int

}

class Base{
    public $data;
}

?>