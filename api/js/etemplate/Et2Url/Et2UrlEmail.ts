/**
 * EGroupware eTemplate2 - Email input widget
 *
 * @license http://opensource.org/licenses/gpl-license.php GPL - GNU General Public License
 * @package api
 * @link https://www.egroupware.org
 * @author Ralf Becker
 */

/* eslint-disable import/no-extraneous-dependencies */
import {Et2InvokerMixin} from "./Et2InvokerMixin";
import {IsEmail} from "../Validators/IsEmail";
import {Et2Textbox} from "../Et2Textbox/Et2Textbox";

/**
 * @customElement et2-url-email
 */
export class Et2UrlEmail extends Et2InvokerMixin(Et2Textbox)
{
	constructor()
	{
		super();
		this.defaultValidators.push(new IsEmail());
		this._invokerLabel = '@';
		this._invokerTitle = 'Compose mail to';
		this._invokerAction = () => this.__invokerAction();
	}

	__invokerAction()
	{
		if (!this._isEmpty() && !this.hasFeedbackFor.length &&
			this.egw().user('apps').mail && this.egw().preference('force_mailto','addressbook') != '1' )
		{
			egw.open_link('mailto:'+this.value);
		}
	}
}
// @ts-ignore TypeScript is not recognizing that this is a LitElement
customElements.define("et2-url-email", Et2UrlEmail);