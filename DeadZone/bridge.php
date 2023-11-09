<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" prefix="og: http://ogp.me/ns#">
<head>
	<title>The Last Stand: Dead Zone</title>
	
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta property="og:title" content="The Last Stand: Dead Zone" />
	<meta property="og:type" content="game" />
	<meta property="og:url" content="https://ag.deadzonegame.com" />
	<meta property="og:site_name" content="The Last Stand: Dead Zone" />
	<meta property="og:description" content="Build, fight, scavenge and survive against infected and humans alike in this action strategy RPG." />

	<link rel="icon" type="image/x-icon" href="favicon.ico" />
	<link rel="shortcut icon" type="image/x-icon" href="favicon.ico" />
	
	<link href="css/reset.css" rel="stylesheet" type="text/css" />
	<link href="css/screen.css" rel="stylesheet" type="text/css" />

	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js"></script>
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	<script type="text/javascript" src="//armorgames.com/service/agi.js"></script>
	<script type="text/javascript" src="js/main-min-160309.js"></script>
	<script type="text/javascript">
		var mt = false;
		var mtPST = "9:45 PM";

		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', 'UA-29984267-1']);
		_gaq.push(['_setDomainName', 'deadzonegame.com']);
		_gaq.push(['_setDetectTitle', false]);
		_gaq.push(['_trackPageview']);
		(function() {
			var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		})();
	</script>
</head>

<body>
	<div id="wrapper">
		<a name="top"></a>
		<div id="header">
			<ul id="nav_ul_left">
				<li class="fuel"><a href="#top" onclick="openGetMoreDialogue()">Get More Fuel</a></li>
				<li class="divider"></li>
				<li><a href="#top" onclick="openRedeemCodeDialogue()">Redeem Code</a></li>
			</ul>
			<ul id="nav_ul_right">
				<li><a href="http://forum.conartistgames.com/index.php/forum/22-support/" target="_blank">Help</a></li>
				<li class="divider"></li>
				<li><a href="http://forum.conartistgames.com/index.php/forum/2-the-last-stand-dead-zone/" target="_blank">Feedback</a></li>
			</ul>
			<div class="clear"></div>
		</div>
		<div id="warning_container"></div>
		<div id="message_container"></div>
		<div id="content">
			<div id="game_wrapper">
				<div id="game_container">
					<div id="noflash" class="error">
						<p><h2>Flash Player Required</h2></p>
						<p><strong>The Last Stand: Dead Zone</strong> requires the latest version of Adobe<sup>&reg;</sup> Flash<sup>&reg;</sup> Player.<br/>It's free, and only takes a small amount of time to download.</p>
						<p>Required version: <strong><span id="noflash_reqVersion"></span></strong></p>
						<p>Currently running version: <strong><span id="noflash_currentVersion"></span></strong></p>
						<div id="downloadFlash">
							<p><a href="http://get.adobe.com/flashplayer/" title="Download Flash Player"><strong>Download Flash Player</strong></a></p>
							<p><a href="?detectflash=false" title="I already have the latest Flash Player">I already have the latest Flash Player!</a></p>
						</div>
					</div>
				</div>
			</div>
			<div id="loading">Connecting to Armor Games...</div>
			<div id="generic_error" class="error"></div>
		</div>
		<div id="footer" align="center">
			 <a href="http://deadzonegame.com/terms" target="_blank">Terms</a> | <a href="http://deadzonegame.com/privacy" target="_blank">Privacy Policy</a> | &copy; 2017 - Con Artist Games Pty Ltd.</div>
			 <div id="userID">Connecting...</div>
			 <div id="conArtistLogo"><a href="http://conartistgames.com" title="Con Artist Games" target="_blank"><img src="imgs/conartistlogo.gif" alt="Con Artist Games"></a></div>
		</div>
	</div>
</body>
</html>