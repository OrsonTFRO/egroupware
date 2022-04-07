
/**
 * EGroupware Custom Html Elements - Multi Video Web Components
 *
 * @license http://opensource.org/licenses/gpl-license.php GPL - GNU General Public License
 * @package etemplate
 * @subpackage api
 * @link https://www.egroupware.org
 * @author Hadi Nategh <hn[at]egroupware.org>
 * @copyright EGroupware GmbH
 */

// Unfortunately compiled version of module:ES2015 TS would break webcomponent constructor.
/*
	This web component allows to merge multiple videos and display them as one single widget/element
	most of the html video attributes and methodes are supported. No controls attribute supported yet.
 */
// Create a class for the element
class multi_video extends HTMLElement {

	constructor() {
		super(); // Create a shadow root
		
		/**
		 * contains video objects of type VideoTagsArray
		 * @private
		 */
		_videos = [];
		/**
		 * keeps duration time internally
		 * @private
		 */

		_duration = 0;
		/**
		 * keeps currentTime internally
		 * @private
		 */

		_currentTime = 0;
		/**
		 * Keeps video playing state internally
		 * @private
		 */

		__playing = false;

		/**
		 * shadow dom container
		 * @private
		 */
		this._shadow = this.attachShadow({
			mode: 'open'
		}); // Create videos wrapper

		/**
		 * wrapper container holds video tags
		 * @private
		 */
		this._wrapper = document.createElement('div');

		this._wrapper.setAttribute('class', 'wrapper'); // Create some CSS to apply to the shadow dom


		this._style = document.createElement('style');
		this._style.textContent = '.wrapper {' + 'width: 100%;' + 'height: auto;' + 'display: block;' + '}' + '.wrapper video {' + 'width: 100%;' + 'height: auto;' + '}'; // attach to the shadow dom

		this._shadow.appendChild(this._style);

		this._shadow.appendChild(this._wrapper);
	}
	/**
	 * set observable attributes
	 * @return {string[]}
	 */


	static get observedAttributes() {
		return ['src', 'type'];
	}
	/**
	 * Gets called on observable attributes changes
	 * @param name attribute name
	 * @param _
	 * @param newVal new value
	 */


	attributeChangedCallback(name, _, newVal) {
		switch (name) {
			case 'src':
				this.__buildVideoTags(newVal);

				break;

			case 'type':
				this._videos.forEach(_item => {
					_item.node.setAttribute('type', newVal);
				});

				break;
		}
	}
	/**
	 * init/update video tags
	 * @param _value
	 * @private
	 */


	__buildVideoTags(_value) {
		let value = _value.split(',');

		let video = null;

		for (let i = 0; i < value.length; i++) {
			video = document.createElement('video');
			video.src = value[i];
			this._videos[i] = {
				node: this._wrapper.appendChild(video),
				loadedmetadata: false,
				timeupdate: false,
				duration: 0,
				previousDurations: 0,
				currentTime: 0,
				active: false,
				index: i
			}; // loadmetadata event

			this._videos[i]['node'].addEventListener("loadedmetadata", function (_i, _event) {
				this._videos[_i]['loadedmetadata'] = true;

				this.__check_loadedmetadata();
			}.bind(this, i)); //timeupdate event


			this._videos[i]['node'].addEventListener("timeupdate", function (_i, _event) {
				this._currentTime = this._videos[i]['previousDurations'] + _event.target.currentTime; // push the next video to start otherwise the time update gets paused as it ends automatically
				// with the current video being ended

				if (this._videos[i].node.ended && !this.ended) this.currentTime = this._currentTime + 0.1;

				this.__pushEvent('timeupdate');
			}.bind(this, i));
		}
	}
	/**
	 * calculates duration of videos
	 * @return {number} returns accumulated durations
	 * @private
	 */


	__duration() {
		let duration = 0;

		this._videos.forEach(_item => {
			duration += _item.duration;
		});

		return duration;
	}
	/**
	 * Get current active video
	 * @return {*[]} returns an array of object consist of current video displayed node
	 * @private
	 */


	__getActiveVideo() {
		return this._videos.filter(_item => {
			return _item.active;
		});
	}
	/**
	 * check if all meta data from videos are ready then pushes the event
	 * @private
	 */


	__check_loadedmetadata() {
		let allReady = true;

		this._videos.forEach(_item => {
			allReady = allReady && _item.loadedmetadata;
		});

		if (allReady) {
			this._videos.forEach(_item => {
				_item.duration = _item.node.duration;
				_item.previousDurations = _item.index > 0 ? this._videos[_item.index - 1]['duration'] + this._videos[_item.index - 1]['previousDurations'] : 0;
			});

			this.duration = this.__duration();
			this.currentTime = 0;

			this.__pushEvent('loadedmetadata');
		}
	}
	/**
	 * Creates event and dispatches it
	 * @param _name
	 */


	__pushEvent(_name) {
		let event = document.createEvent("Event");
		event.initEvent(_name, true, true);
		this.dispatchEvent(event);
	}
	/**************************** PUBLIC ATTRIBUTES & METHODES *************************************************/

	/****************************** ATTRIBUTES **************************************/

	/**
	 * set src
	 * @param _value
	 */


	set src(_value) {
		let value = _value.split(',');

		Array.from(this._wrapper.children).forEach(_ch => {
			_ch.remove();
		});

		this.__buildVideoTags(value);
	}
	/**
	 * get src
	 * @return string returns comma separated sources
	 */


	get src() {
		return this.src;
	}
	/**
	 * currentTime
	 * @param _time
	 */


	set currentTime(_time) {
		let ctime = _time;
		this._currentTime = _time;

		this._videos.forEach(_item => {
			if (ctime < _item.duration + _item.previousDurations && (ctime == 0 && _item.previousDurations == 0 || ctime > _item.previousDurations)) {
				if (this.__playing && _item.node.paused) _item.node.play();
				_item.currentTime = Math.abs(_item.previousDurations - ctime);
				_item.node.currentTime = _item.currentTime;
				_item.active = true;
			} else {
				_item.active = false;

				_item.node.pause();
			}

			_item.node.hidden = !_item.active;
		});
	}
	/**
	 * get currentTime
	 * @return {number}
	 */


	get currentTime() {
		return this._currentTime;
	}
	/**
	 * set video duration time attribute
	 * @param _value
	 */


	set duration(_value) {
		this._duration = _value;
	}
	/**
	 * get video duration time
	 */


	get duration() {
		return this._duration;
	}
	/**
	 * get paused attribute
	 */


	get paused() {
		return this.__getActiveVideo()[0] ? (this.__getActiveVideo()[0].node ? this.__getActiveVideo()[0].node.paused : undefined) : undefined;
	}
	/**
	 * set muted attribute
	 * @param _value
	 */


	set muted(_value) {
		this._videos.forEach(_item => {
			_item.node.muted = _value;
		});
	}
	/**
	 * get muted attribute
	 */


	get muted() {

		return this.__getActiveVideo()[0] ? (this.__getActiveVideo()[0].node ? this.__getActiveVideo()[0].node.muted : undefined) : undefined;;
	}
	/**
	 * get video ended attribute
	 */


	get ended() {
		return this._videos[this._videos.length - 1] ? (this._videos[this._videos.length - 1].node ? this._videos[this._videos.length - 1].node.ended : undefined) : undefined;
	}
	/**
	 * set playbackRate
	 * @param _value
	 */


	set playbackRate(_value) {
		this._videos.forEach(_item => {
			_item.node.playbackRate = _value;
		});
	}
	/**
	 * get playbackRate
	 */


	get playbackRate() {
		return this.__getActiveVideo()[0] ? (this.__getActiveVideo()[0].node ? this.__getActiveVideo()[0].node.playbackRate : undefined) : undefined;
	}
	/**
	 * set volume
	 */


	set volume(_value) {
		this._videos.forEach(_item => {
			_item.node.volume = _value;
		});
	}
	/**
	 * get volume
	 */


	get volume() {
		return this.__getActiveVideo()[0] ? (this.__getActiveVideo()[0].node ? this.__getActiveVideo()[0].node.volume : undefined) : undefined;
	}
	/************************************************* METHODES ******************************************/

	/**
	 * Play video
	 */


	play() {
		this.__playing = true;
		return this.__getActiveVideo()[0] ? (this.__getActiveVideo()[0].node ? this.__getActiveVideo()[0].node.play() : undefined) : undefined;
	}
	/**
	 * pause video
	 */


	pause() {
		this.__playing = false;
		this.__getActiveVideo()[0] ? (this.__getActiveVideo()[0].node ? this.__getActiveVideo()[0].node.pause() : undefined) : undefined;
	}

} // Define the new multi-video element


customElements.define('multi-video', multi_video);