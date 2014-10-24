/**
 * sliderFx.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function( window ) {
	
	'use strict';

	var Modernizr = window.Modernizr,
		transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		},
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		support = { csstransitions : Modernizr.csstransitions };

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function SliderFx( el, options ) {
		this.el = el;
		this.options = extend( {}, this.options );
		extend( this.options, options );
		this._init();
		this._initEvents();
	}

	SliderFx.prototype.options = {
		// default transition speed (ms)
		speed : 500,
		// default transition easing
		easing : 'ease',
		// path definitions
		paths : {
			rect : 'M33,0h41c0,0,0,9.871,0,29.871C74,49.871,74,60,74,60H32.666h-0.125H6c0,0,0-10,0-30S6,0,6,0H33',
			curve : { 
				right : 'M33,0h41c0,0,5,9.871,5,29.871C79,49.871,74,60,74,60H32.666h-0.125H6c0,0,5-10,5-30S6,0,6,0H33', 
				left : 'M33,0h41c0,0-5,9.871-5,29.871C69,49.871,74,60,74,60H32.666h-0.125H6c0,0-5-10-5-30S6,0,6,0H33'
			}
		}
	}

	SliderFx.prototype._init = function() {
		// the list of items
		this.itemsList = this.el.querySelector( 'ul' );
		// the items (li elements)
		this.items = [].slice.call( this.itemsList.querySelectorAll( 'li' ) );
		// total number of items
		this.itemsCount = this.items.length;
		// current and old item´s index
		this.curr = this.old = 0;
		// check if it's currently animating
		this.isAnimating = false;
		// the itemsList (ul) will have a width of 100% x itemsCount
		this.itemsList.style.width = 100 * this.itemsCount + '%';
		// apply the transition
		if( support ) {
			this.itemsList.style.WebkitTransition = '-webkit-transform ' + this.options.speed + 'ms ' + this.options.easing;
			this.itemsList.style.transition = 'transform ' + this.options.speed + 'ms ' + this.options.easing;
		}
		var self = this;
		this.items.forEach( function( item ) {
			// each item will have a width of 100 / itemsCount
			item.style.width = 100 / self.itemsCount + '%';
		} );
		// add navigation arrows if there is more than 1 item
		if( this.itemsCount > 1 ) {
			// add navigation arrows (the previous arrow is not shown initially):
			var nav = document.createElement( 'nav' ),
				addArrow = function( c, content, disabled ) {
					var el = document.createElement( 'span' );
					el.className = c;
					el.innerHTML = content;
					if( disabled ) {
						classie.add( el, 'disabled' );
					}
					nav.appendChild( el );
					return el;
				},
				createSvg = function( html ) {
					var frag = document.createDocumentFragment(),
						temp = document.createElement('div');
					temp.innerHTML = html;
					while (temp.firstChild) {
						frag.appendChild(temp.firstChild);
					}
					return frag;
				}

			this.navPrev = addArrow( 'prev', '&lt;', true );
			this.navNext = addArrow( 'next', '&gt;' );
			this.el.appendChild( nav );

			// add svgs with rectangle path
			this.items.forEach( function( item ) {
				var svg = createSvg('<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 80 60" preserveAspectRatio="none"><path d="' + self.options.paths.rect + '"/></svg>');
				item.insertBefore( svg, item.childNodes[0] );
				
				var s = Snap( item.querySelector('svg') );
				item.path = s.select( 'path' );
			} );
		}
	}

	SliderFx.prototype._initEvents = function() {
		var self = this;
		if( this.itemsCount > 1 ) {
			this.navPrev.addEventListener( 'click', function() { self._navigate( 'prev' ) } );
			this.navNext.addEventListener( 'click', function() { self._navigate( 'next' ) } );
			
			var transitionendfn = function() { self.isAnimating = false; };
			if( support ) {
				self.itemsList.addEventListener( transEndEventName, transitionendfn );
			}
			else {
				transitionendfn.call();
			}

			// keyboard navigation events
			document.addEventListener( 'keydown', function( ev ) {
				var keyCode = ev.keyCode || ev.which;
				switch (keyCode) {
					// left key
					case 37:
						self._navigate('prev');
						break;
					// right key
					case 39:
						self._navigate('next');
						break;
				}
			} );
		}
	}

	SliderFx.prototype._navigate = function( dir ) {
		// do nothing if the itemsList is currently moving
		if( this.isAnimating || dir === 'next' && this.curr >= this.itemsCount - 1 || dir === 'prev' && this.curr <= 0 ) {
			return false;
		}
		this.isAnimating = true;
		this.direction = dir;
		// update old and current values
		this.old = this.curr;
		if( dir === 'next' && this.curr < this.itemsCount - 1 ) {
			++this.curr;
		}
		else if( dir === 'prev' && this.curr > 0 ) {
			--this.curr;
		}
		// slide
		this._slide();
	}

	SliderFx.prototype._slide = function() {
		var self = this,
			startSlider = function() {
				// check which navigation arrows should be shown
				self._toggleNavControls();
				// translate value
				var translateVal = -1 * self.curr * 100 / self.itemsCount;
				self.itemsList.style.WebkitTransform = 'translate3d(' + translateVal + '%,0,0)';
				self.itemsList.style.transform = 'translate3d(' + translateVal + '%,0,0)';
			}

		this._morphSVGs( startSlider );
	}

	SliderFx.prototype._morphSVGs = function( callback ) {
		var self = this,
			speed = this.options.speed,
			pathCurvedLeft = this.options.paths.curve.left,
			pathCurvedRight = this.options.paths.curve.right,
			pathRectangle = this.options.paths.rect,
			dir = this.old < this.curr ? 'right' : 'left';

		// morph svg path on exiting slide to "curved"
		this.items[ this.old ].path.stop().animate( { 'path' : dir === 'right' ? pathCurvedLeft : pathCurvedRight }, speed * .5, mina.easeout );

		// the slider starts a bit later...
		setTimeout(function() { callback.call(); }, speed * .2 );
		
		// change svg path on entering slide to "curved"
		var currItem = this.items[ this.curr ];
		currItem.querySelector('path').setAttribute( 'd', dir === 'right' ? pathCurvedLeft : pathCurvedRight );
		// morph svg path on entering slide to "rectangle"
		setTimeout(function() { currItem.path.stop().animate( { 'path' : pathRectangle }, speed * 3, mina.elastic ); }, speed * .5 );
	}

	// show/disable arrows
	SliderFx.prototype._toggleNavControls = function() {
		switch( this.curr ) {
			case 0 : classie.remove( this.navNext, 'disabled' ); classie.add( this.navPrev, 'disabled' ); break;
			case this.itemsCount - 1 : classie.add( this.navNext, 'disabled' ); classie.remove( this.navPrev, 'disabled' ); break;
			default : classie.remove( this.navNext, 'disabled' ); classie.remove( this.navPrev, 'disabled' ); break;
		}
	}

	// add to global namespace
	window.SliderFx = SliderFx;

})( window );