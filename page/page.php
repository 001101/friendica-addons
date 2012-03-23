<?php
/**
 * Name: Page
 * Description: Shows lists of community pages
 * Version: 1.0
 * Author: Mike Macgirvin <mike@macgirvin.com>
 * based on pages plugin by
 * Author: Michael Vogel <ike@piratenpartei.de>
 *
 */

function page_install() {
	register_hook('page_end', 'addon/page/page.php', 'page_page_end');
}

function page_uninstall() {
	unregister_hook('page_end', 'addon/page/page.php', 'page_page_end');
}


function page_getpage($uid) {


	$pagelist = array();

	$contacts = q("SELECT `id`, `url`, `name` FROM `contact`
			WHERE `network`= 'dfrn' AND `forum` = 1 AND `uid` = %d",
			intval($uid)
	);

	$page = array();

	// Look if the profile is a community page
	foreach($contacts as $contact) {
		$page[] = array("url"=>$contact["url"], "name"=>$contact["name"], "id"=>$contact["id"]);
	}
	return($page);
}

function page_page_end($a,&$b) {
	// Only move on if if it's the "network" module and there is a logged on user
	if (($a->module != "network") OR ($a->user['uid'] == 0))
		return;

	$page = '<div id="page-sidebar" class="widget">
			<div class="title tool">
			<h3>'.t("Community Pages").'</h3></div>
			<div id="sidebar-page-list"><ul>';

	$contacts = page_getpage($a->user['uid']);

	foreach($contacts as $contact) {
		$page .= '<li class="tool"><a href="'.$a->get_baseurl().'/redir/'.$contact["id"].'" class="label" target="external-link">'.
				$contact["name"]."</a></li>";
	}
	$page .= "</ul></div></div>";
	if (sizeof($contacts) > 0)
		$a->page['aside'] = $page . $a->page['aside'];
}
?>
