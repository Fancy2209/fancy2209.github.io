<?php

// Set the content type to JSON
header('Content-Type: application/json');

// Define the response data
$response = array(
    "success" => true,
    "services" => array(
        array(
            "service" => "armor",
            "mode" => 1,
            "message" => "",
            "onlineETA" => "",
            "htmlMessage" => ""
        )
    )
);

// Encode the response data as JSON and print it
echo json_encode($response);
