<?php

    require(__DIR__ . "/../includes/config.php");

    // explode the parameter into two parameters 
    $params =explode(",", $_GET["geo"]);
    
    // remove "US" param, as all addresses are US
    if (($index = array_search("US", $params)) !== false) {
        unset($params[$index]);
    }    
    
    // build SQL statement
    $sql = "SELECT * FROM places WHERE ";
    for ($i = 0; $i < count($params); $i++) {
        // if param is numeric, assume a postal code
        if (is_numeric($params[$i])) {
            $sql .= 'postal_code LIKE "' . $params[$i] . '%"';
        } else {
            $sql .= 
                '(place_name  LIKE "' . $params[$i] . '%" OR ';
                if( strlen($params[$i]) <= 2 )
                {
                    $sql .= 'admin_code1 LIKE "' . $params[$i] . '%" OR ';
                }
                else
                {   
                    $sql .= "";
                } 
                   
                    $sql .='admin_name1 LIKE "' . $params[$i] . '%")';
        }
        
        if ($i < (count($params) - 1)) {
            $sql .= " AND ";
        }
    }

    // search database for places matching $_GET["geo"]
    $places = query($sql);
    
    // output places as JSON (pretty-printed for debugging convenience)
    header("Content-type: application/json");
    print(json_encode($places, JSON_PRETTY_PRINT));

?>
