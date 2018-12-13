/* eslint-env jquery */

$( function () {

	var selection = document.getSelection(),
		hasSelectionChange = 'onselectionchange' in document,
		events = hasSelectionChange ? 'selectionchange' : 'mousemove mouseup keypress keydown keyup';

	function cssProps( rect ) {
		return {
			left: rect.left,
			top: rect.top,
			width: Math.max( rect.width, 1 ),
			height: Math.max( rect.height, 1 )
		};
	}

	function render() {
		var i, l, rect, rects, offset,
			$col, range, $highlightsNative, $highlightsFixed;

		if ( selection.rangeCount === 0 ) {
			return;
		}

		$col = $( selection.focusNode ).closest( '.col' );
		if ( !$col.is( '.col-text' ) ) {
			return;
		}
		range = selection.getRangeAt( 0 );
		$highlightsNative = $( '<div>' );
		$highlightsFixed = $( '<div>' );

		if ( !$col.length ) {
			return;
		}

		// Native
		rects = range.getClientRects();
		for ( i = 0, l = rects.length; i < l; i++ ) {
			$highlightsNative.append( $( '<div>' ).addClass( 'highlight' ).css( cssProps( rects[ i ] ) ) );
		}
		$( '.highlights-native' ).empty().append( $highlightsNative );

		rect = range.getBoundingClientRect();
		$highlightsNative.append( $( '<div>' ).addClass( 'bounding' ).css( cssProps( rect ) ) );

		// Fixed
		rects = RangeFix.getClientRects( range );
		for ( i = 0, l = rects.length; i < l; i++ ) {
			$highlightsFixed.append( $( '<div>' ).addClass( 'highlight' ).css( cssProps( rects[ i ] ) ) );
		}
		$( '.highlights-fixed' ).empty().append( $highlightsFixed );

		rect = RangeFix.getBoundingClientRect( range );
		if ( rect ) {
			$highlightsFixed.append( $( '<div>' ).addClass( 'bounding' ).css( cssProps( rect ) ) );
		}

		// Adjust for container position
		offset = $col[ 0 ].getBoundingClientRect();
		$( '.highlights' ).css( { top: -offset.top, left: -offset.left } );
	}

	$( document ).on( events, render );
	$( window ).on( 'resize', render );

	$( '.ce' ).on( 'input keyup', function () {
		$( '.ce-mirror' ).html( $( this ).html() );
	} );
} );
