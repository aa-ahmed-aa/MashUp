# MaghUp
this mashes up googleNews and googleMaps to easily find the news about the city on the map and it also can locate your current location on the map.

#Install on linux
-copy mashup folder to you vhosts folder <br>
-on the command execute the following : `sudo gedit /etc/hosts`   <br>
add the follwing to your hosts : `127.0.0.1   mashup`<br>

#Import the DataBase
-import the database to your phpmyadmin<br>
	note : it's an empty database.<br> 
-go to : http://download.geonames.org/export/zip/ and download the lat&lng of your country extract and get the txt file to your `mashup/bin` .<br>
-and then using the terminal go to bin folder and execute the following `./import US.txt`<br> 
	after inserting all the data into the database you will get message : `You inserted the data sucessfuly`<br>
-go to : `mashup/includes/constants.php` and change the database configuration.<br>

#Ready & go
open your browser and go to MashUp you can navigate the cities and watch news of every city and click on position to locate your current location on the map. 
