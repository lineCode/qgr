import { Div, Button, Input } from 'qgr';
import 'qgr/util';
import 'qgr/http';
import { alert } from 'qgr/dialog';
import { Mynavpage } from './public';

function url(evt) {
	return evt.sender.owner.find('input').value;
}

function Get(evt) {
	http.get(url(evt), function({ data }) {
		var content = data.toString('utf-8');
		alert(content.substr(0, 200).trim() + '...');
	}.catch(function(err) {
		alert(err.message);
	}));
}

function Post(evt) {
	http.post(url(evt), 'post data', function({ data }) {
		alert(data.toString('utf-8').substr(0, 200).trim() + '...');
	}.catch(function(err) {
		alert(err.message);
	}));
}

function GetSync(evt) {
	try {
		alert(http.getSync(url(evt)).toString('utf-8').substr(0, 200).trim() + '...');
	} catch (err) {
		alert(err.message);
	}
}

function PostSync(evt) {
	try {
		alert(http.postSync(url(evt), 'post data').toString('utf-8').substr(0, 200).trim() + '...');
	} catch (err) {
		alert(err.message);
	}
}

function keyenter(evt) {
	evt.sender.blur();
}

//console.log('-------------', String(util.garbage_collection), typeof util.garbage_collection);

export const vx = (
	<Mynavpage title="Http" source=resolve(__filename)>
		<Div width="full">
			<Input class="input" id="input" 
				placeholder="Please enter http url .." 
				value="https://github.com/"
				//value="http://192.168.1.11:1026/Tools/test_timeout?1"
				return_type="done" onKeyEnter=keyenter />
			<Button class="long_btn" onClick=Get>Get</Button>
			<Button class="long_btn" onClick=Post>Post</Button>
			<Button class="long_btn" onClick=GetSync>GetSync</Button>
			<Button class="long_btn" onClick=PostSync>PostSync</Button>
			<Button class="long_btn" onClick=util.garbageCollection>GC</Button>
			<Button class="long_btn" onClick=util.exit>Exit</Button>
		</Div>
	</Mynavpage>
)
