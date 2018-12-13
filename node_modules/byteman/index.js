//
//	Convert bytes to a human readable form
//
module.exports = function(bytes, decimals, format)
{
	//
	//	If the size is 0, then we can stop right away.
	//
	if(bytes == 0)
	{
		return '0 Byte';
	}

	format = format || false;

	//
	//	Convert bytes to kilobytes
	//
	let k = 1000;

	//
	//	Set how many position after decimal to show. The default is 3
	//
	let decimal = decimals || 3;

	//
	//	Array with all the possible formats.
	//
	let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	//
	//	Set a variable that will count the iterations
	//
	let x = 0;

	//
	//	Copy the bytes that we go, so we can use them later on
	//
	let bytes_copy = bytes;

	//
	//	Divide by K and see how many times we'll be able to divide
	//
	while (bytes_copy >= k)
	{
		bytes_copy /= k;
		x++;
	}

	//
	// Calculates the power
	//
	let power = Math.pow(k, x);

	//
	//	Convert bytes in to a human readable size
	//
	let human_form = bytes / power;

	//
	//	Set how many decimal places do we want to display
	//
	let formated_nr = human_form.toFixed(decimal);

	//
	// parses a string argument and returns a floating point number
	//
	let fpn = parseFloat(formated_nr);

	let tail = "";

	if(format)
	{
		tail = ' ' + sizes[x];
	}

	//
	// -> Return the human readable byte cont.
	//
	return fpn + tail;
}