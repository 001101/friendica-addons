<?php
/**
 * Name: MemberSince
 * Description: Display membership date in profile
 * Version: 1.0
 * Author: Mike Macgirvin <http://macgirvin.com/profile/mike>
 *
 */

use Friendica\Core\Addon;
use Friendica\Core\L10n;
use Friendica\Util\DateTimeFormat;

function membersince_install()
{
	Addon::registerHook('profile_advanced', 'addon/membersince/membersince.php', 'membersince_display');
}

function membersince_uninstall()
{
	Addon::unregisterHook('profile_advanced', 'addon/membersince/membersince.php', 'membersince_display');
}

function membersince_display(&$a, &$b)
{
	// Works in Vier
	$b = preg_replace('/<\/dl>/', "</dl>\n\n\n<dl id=\"aprofile-membersince\" class=\"aprofile\">\n<dt>" . L10n::t('Member since:') . "</dt>\n<dd>" . DateTimeFormat::local($a->profile['register_date']) . "</dd>\n</dl>", $b, 1);

	// Trying for Frio
	//$b = preg_replace('/<\/div>/', "<div id=\"aprofile-membersince\" class=\"aprofile\"><hr class=\"profile-separator\"><div class=\"profile-label-name\">" . L10n::t('Member since:') . "</div><div class=\"profile-entry\">" . DateTimeFormat::local($a->profile['register_date']) . "</div></div>", $b, 1);
}
