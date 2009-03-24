<?php
/**
 * eGroupWare - Notifications
 * serves the hook "after_navbar" to create the notificationwindow
 *
 * @abstract notificatonwindow is an empty and non displayed 1px div which gets rezised
 * and populated if a notification is about to be displayed.
 * @license http://opensource.org/licenses/gpl-license.php GPL - GNU General Public License
 * @package notifications
 * @subpackage ajaxpoup
 * @link http://www.egroupware.org
 * @author Cornelius Weiss <nelius@cwtech.de>
 * @version $Id$
 */
$notification_config = config::read('notifications');
if ($notification_config['popup_enable']) {
	$GLOBALS['egw']->translation->add_app('notifications');
	echo '<script src="'. $GLOBALS['egw_info']['server']['webserver_url']. '/notifications/js/notificationajaxpopup.js?'.
		filemtime(EGW_SERVER_ROOT.'/notifications/js/notificationajaxpopup.js'). '" type="text/javascript"></script>';
	echo '<script type="text/javascript">egwpopup_init();</script>';
	echo '
		<div id="egwpopup" style="display: none; z-index: 999;">
			<div id="egwpopup_header">'.lang('Notification').'</div>
			<div id="egwpopup_message"></div>
			<div id="egwpopup_footer">
				<input id="egwpopup_ok_button" type="submit" value="'. lang('ok'). '" onClick="egwpopup_button_ok();">
			</div>
		</div>
	';
}
unset($notification_config);