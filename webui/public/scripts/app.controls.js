app.Ext(app,{controls:{
/*--------------------*/

/*Converts a bunch of input to a data model*/
Selections:function(config)
{
/*

	getData:function()
	finishedSelection:function()
	addData; function(text,_selectionSessionData,function(newItem){}) // //selections that you can add to //
	searchData;function(text,_selectionSessionData,function(results))// selections you can search with
	onShow;
	onDone;
	onSelect;
	onFocus;
	onBlur;
	onFilter;
	onSelect;
	itemTemplate
	footer

	setSessionData()

	[]
*/

/*------Selection Control Sub components --------------*/
	var SelectionHeader = function(config){
		var _this = this;
		var _onAdd = config.onAdd;
		var _onFocus = config.onFocus;
		var _onBlur = config.onBlur;
		var _onKeyup = config.onKeyup

		var elm = cELM('div','selection_header');
		var loading = cELM('div','loading');

		var input = cELM('input','input_text');
		var btAdd = cELM('div','button btAdd');
		var btOK = cELM('div','button btOK');
		btOK.style.display = 'none';

		var _completeAdd = function(results){
			input.readOnly = false;

			input.style.display = "block";
			btOK.style.display = 'none';
			btAdd.style.display = 'block';

			if(results)
			{
				input.value = "";
			}
			else
			{
				//error
			}
		}

		var _start = function()
		{
			btAdd.style.display = 'none';
			btOK.style.display = 'block';
		}

		var _adding = function()
		{
			input.blur();
			input.style.display = "none";
			btOK.style.display = 'none';
			btAdd.style.display = 'none';
		}

		
		btAdd.onclick = function(e)
		{
			input.focus();
		}

		
		btOK.onclick = function(event)
		{
			_adding();
			_onAdd(input.value,_completeAdd);
		}

		input.onkeyup = function(e){
			if(_onKeyup)
				_onKeyup(input.value);
		}
		input.onkeypress = function(e) {
			if(e.keyCode == 13) 
			{
				_adding();
				_onAdd(input.value,_completeAdd);
				
			}
			else
			{
				_start();
			}
		};
		_this.reset = function(e)
		{
			input.value = "";
			input.style.display = 'block';
			btAdd.style.display = 'block';
			btOK.style.display = 'none';
			input.blur();
		}

		input.onfocus=function(e){
			btAdd.style.display = 'none';
			if(_onFocus)
				_onFocus();
		};
		input.onblur = function(e)
		{

			if(_onBlur)
				_onBlur();

			if(!IsEmpty(input.value))
			{

			}
			else
			{
				input.style.display = 'block';
				btAdd.style.display = 'block';			
				btOK.style.display = 'none';
			}
			
		}
		_this.getELM = function()
		{
			return elm;
		}

		_this.getHTML = function()
		{
			elm.addELM(loading);
			elm.addELM(input);
			elm.addELM(btAdd);
			elm.addELM(btOK);

			return elm;
		}

	};

	var SelectionSearchHeader = function(config){
		var _this = this;
		var _onSearch = config.onSearch;
		var _onFocus = config.onFocus;
		var _onBlur = config.onBlur;
		var _onFilter = config.onFilter;
		var _onKeyup = config.onKeyup;

		var elm = cELM('div','selection_header selection_search');
		var loading = cELM('div','loading');

		var input = cELM('input','input_text');
		var btSearch = cELM('div','button btSearch');
		var btOK = cELM('div','button btOK');
		btOK.style.display = 'none';

		var isFirstFocus = false;

		var _completeSearch = function(results){
			input.readOnly = false;

			//input.style.display = "block";
			//btOK.style.display = 'none';
			//btSearch.style.display = 'block';

			if(results)
			{
				//input.value = "";
			}
			else
			{
				//error
			}
		}

		var _start = function()
		{
			btSearch.style.display = 'none';
			btOK.style.display = 'block';
		}

		var _searching = function()
		{
			input.blur();
			//input.style.display = "none";
			//btOK.style.display = 'none';
			//btSearch.style.display = 'none';
		}

		
		btSearch.onclick = function(e)
		{
			input.focus();
		}

		
		btOK.onclick = function(event)
		{
			_searching();
			_onSearch(input.value,_completeSearch);
		}

		input.onKeyup = function(e)
		{
			if(_onFilter)
				_onFilter(input.value);
		}
		
		input.onkeypress = function(e) {
			
			if(e.keyCode == 13) 
			{
				_searching();
				_onSearch(input.value,_completeSearch);
			}
			else
			{
				_start();
			}
		};
		
		_this.reset = function(e)
		{
			input.value = "";
			input.style.display = 'block';
			btSearch.style.display = 'block';
			btOK.style.display = 'none';
			input.blur();
		}
		input.onfocus=function(e){
			btSearch.style.display = 'none';
			if(_onFocus)
			{
				if(!isFirstFocus)
				{
					isFirstFocus = true;
					_onFocus();
				}
					
			}
				
		};

		input.onblur = function(e)
		{

			if(_onBlur)
				_onBlur();

			if(!IsEmpty(input.value))
			{

			}
			else
			{
				//isFirstFocus = false;
				input.style.display = 'block';
				btSearch.style.display = 'block';			
				btOK.style.display = 'none';
			}
			
		}

		_this.getELM = function()
		{
			return elm;
		}

		_this.getHTML = function()
		{
			elm.addELM(loading);
			elm.addELM(input);
			elm.addELM(btSearch);
			elm.addELM(btOK);

			return elm;
		}

	};

	var SelectionItem = function(data,params){
		var _this = this;
		var _data = data;
		var _isSelect = data.isSelected;
		var _template = params.template;
		var _onSelect = params.onSelect;


		var elm = cELM('div','selection');
		
		_this.update = function(data)
		{
			_data = data;
			_isSelect = data.isSelected;

			elm.className = _isSelect ? "selection selected" : "selection";
		},

		_this.getData = function()
		{
			return _data;
		}

		_this.getELM = function()
		{
			return elm;
		}

		_this.getHTML = function()
		{
			if(_template)
			{
				var result = _template(_data);
				elm.innerHTML = result;
			}
			
			_this.update(_data);


			return elm;
		}

		_this.select = function(isSelect,e)
		{
			_data.isSelected = isSelect;
			_this.update(_data);

			_onSelect(_isSelect,_data,e);
		}

		if(_data.onclick)
			elm.onclick = _data.onclick
		else	
			elm.onclick = function(e)
			{
				_this.select(!_isSelect,e);
			}

		return _this;

	}
/*------Selection Control Logic Here --------------*/
	var _this = this;
	var _items = {};
	var _config = config;
	var _selectedItems = {};
	var _unSelectedItems = {};
	var _selectionSessionData = null;

	
	var _getData = config.getData;
	var _finishedSelection = config.finishedSelection;
	var _addData = config.addData;
	var _searchData = config.searchData;
	var _onShow = config.onShow;
	var _onDone = config.onDone;
	var _onSelectHandler = config.onSelect;
	var _onFocus = config.onFocus;
	var _onBlur = config.onBlur;
	var _onFilter = config.onFilter;
	var _onSelect = cELM.onSelect;

	var _footer = config.footer;

	var _originalData = [];

	var _itemTemplate = null;
	if(config.itemTemplate)
		_itemTemplate = config.itemTemplate;


	var elm = cELM('div','selections');
	if(config.cssName)
		elm = cELM('div','selections '+config.cssName);


	
	var content = cELM('div','content');
	var content_scroll = cELM('div','content_scroll');

	var loadingSpinner = cELM('div','background_text');
	loadingSpinner.innerHTML = 'Loading...';
	loadingSpinner.style.display = 'block';
	content_scroll.addELM(loadingSpinner);


	var plcHolder = cELM('div','placeholder_empty');
	if(_config.emptyMessage)
	{
		plcHolder.innerHTML = _config.emptyMessage;
		plcHolder.style.display = 'none';
		content_scroll.addELM(plcHolder);
	}
	

	var addingElm = cELM('div','selection adding')
	addingElm.innerHTML = "Adding ..."

	var btDone = cELM('div','btDone');
	btDone.style.display = 'none';
	btDone.onclick = function(e)
	{
		_this.onDone();
	}

	//updates the data without changing states
	var _refreshData = function(data)
	{
		content.scrollTop = 0;

		for(var id in _items)
		{
			var item = _items[id];

			item.getELM().parentNode.removeChild(item.getELM());
		}

		_items = {};

		for(var i = 0; i < data.length; i++)
		{
			_addEntry(data[i],false);
		}

		if(data.length == 0)
		{
			if(_config.emptyMessage)
			{
				loadingSpinner.style.display = "none";
				plcHolder.style.display = "block";
			}			
		}
	}

	var _addEntry = function(data,isInsert)
	{
		var id = null;
		if(data.id)
			id = data.id
		else if(data._id)
			id = data._id

		if(!_items[id])
		{
			var d = new SelectionItem(data,{
				template:_itemTemplate,
				onSelect:_this.onSelect
			});

			_items[id] = d;
			if(isInsert)
			{
				content.insertELM(d);
			}
			else
				content.addELM(d);
		}
		else
		{
			_items[id].update(data);
		}
	}

	var header  = null;
	if(_addData)
	{

		header = SelectionHeader({
			onKeyup:function(value){
				if(_onFilter)
					_onFilter(value,_originalData,_refreshData);
			},
			onFocus:function(){
				if(_onFocus)
					_onFocus(_this.update);
			},
			onBlur:function(){
				if(_onBlur)
					_onBlur(_this.update);
			},
			onAdd:function(text,callback){

				content.insertELM(addingElm);

				_addData(text,_selectionSessionData,function(newLists){
					

					addingElm.parentNode.removeChild(addingElm);

					callback(newLists);

					_showOriginalData();
					
					for(var i = 0; i < newLists.length; i++)
					{
						var newList = newLists[i];
						newList.isSelected = true;
						_addEntry(newList,true);

						var id = null;
						if(newList.id)
							id = data.id
						else if(newList._id)
							id = newList._id

						_selectedItems[id] = newList;
					}
					
					content_scroll.scrollTop = 0;



				});
			}
		});

	}
	else if (_searchData)
	{
		var clearContent = function(){

			content.scrollTop = 0;

			_selectedItems = {};
			_unSelectedItems = {};

			for(var id in _items)
			{
				var item = _items[id];

				item.getELM().parentNode.removeChild(item.getELM());
			}
			_items = [];

		};
		header = new SelectionSearchHeader({
			onFocus:function(){
				if(_onFocus)
				{
					clearContent();
					_onFocus(_this.update,_originalData,_refreshData);
				}
			},
			onBlur:function(){
				if(_onBlur)
					_onBlur(_this.update);
			},
			onSearch:function(text,callback){



				plcHolder.style.display = "none";


				loadingSpinner.style.display = "block";


				clearContent();

				
				_searchData(text,_selectionSessionData,function(results){
					
					loadingSpinner.style.display = "none";
					
					
					callback(results);

					for(var i = 0; i < results.length; i++)
					{
						var result = results[i];
						_addEntry(result,true);
					}
					
					content_scroll.scrollTop = 0;


					if(results.length == 0)
					{
						if(_config.emptyMessage)
						{
							plcHolder.innerHTML = "Can't find a friend? <br/>" + '<a class="email" title="Email a friend" href="" onclick="javascript:window.location=\'mailto:?subject=Feedback on Bestlyst?&body=I thought you might have great feedback or ideas for Bestlyst: \' + window.location;">Invite</a>'
							 +" them to bestlyst.";
							plcHolder.style.display = 'block';
							content_scroll.addELM(plcHolder);
						}
						
					}

				});
			}
		});
	}

	var _showOriginalData = function()
	{
		content.scrollTop = 0;

		for(var id in _items)
		{
			var item = _items[id];

			item.getELM().parentNode.removeChild(item.getELM());
		}

		_items = {};	
						
		for(var i = 0; i < _originalData.length; i++)
		{
			_addEntry(_originalData[i],false);
		}	
	}


	var _clearData = function()
	{
		_selectedItems = {};
		_unSelectedItems = {};

		btDone.style.display = 'none';
		plcHolder.style.display = "none";
		if(header)
			header.getELM().style.display = 'none';

		content.scrollTop = 0;

		for(var id in _items)
		{
			var item = _items[id];

			item.getELM().parentNode.removeChild(item.getELM());
		}

		_items = {};

		content.style.display = 'block';


	}

	_this.getELM = function()
	{
		return elm;
	}
	

	_this.getHTML = function()
	{
		if(_addData || _searchData)
			elm.addELM(header);


		if(_config.headerTemplate)
		{
			elm.addELM(_config.headerTemplate);
		}

		content_scroll.addELM(content);
		elm.addELM(content_scroll);
		
		
		if(_footer)
			elm.addELM(_footer);
		
		if(_itemTemplate)
			elm.addELM(btDone);
		
		

		return elm;
	}
	_this.onSelect = function(isSelected,data,e){


		var id = null;
		if(data.id)
			id = data.id
		else if(data._id)
			id = data._id

		if(isSelected)
		{
			_selectedItems[id] = data;
			if(_unSelectedItems[id])
				delete _unSelectedItems[id];

		}
		else
		{
			_unSelectedItems[id] = data;
			if(_selectedItems[id])
				delete _selectedItems[id];
		}

		if(_onSelectHandler)
			_onSelectHandler(isSelected,data,e);


	}
	
	_this.getSelections = function(){
		return {
			session:_selectionSessionData,
			selected:_selectedItems,
			unselected:_unSelectedItems
		}
	}


	_this.update = function(data)
	{
		if(data)
		{	
			_originalData = data;

			btDone.style.display = 'block';
			if(header)
				header.getELM().style.display = 'block';

			if(data.length > 0)
			{
				loadingSpinner.style.display = "none";
				plcHolder.style.display = "none";
				
			}
			else
			{
				if(_config.emptyMessage)
				{
					loadingSpinner.style.display = "none";
					plcHolder.style.display = "block";
				}
			}
				
			for(var i = 0; i < data.length; i++)
			{
				_addEntry(data[i],false);
			}
	
			if(_footer)
				_footer.show();
		}
	}


	_this.disableContent = function(message){
		
		btDone.style.display = 'none';
		if(header)
			header.getELM().style.display = 'none';

		content.scrollTop = 0;

		content.style.display = 'none';

		if(message)
			loadingSpinner.innerHTML = message;
	
		
		loadingSpinner.style.display = "block";
	}
	_this.finish = function()
	{
		if(header)
			header.reset();
		if(_finishedSelection)
			_finishedSelection(_selectionSessionData,_selectedItems,_unSelectedItems);		
	}
	_this.show = function(isShow)
	{
		
		if(isShow == true)
		{		
			_clearData();

			loadingSpinner.style.display = "block";
			loadingSpinner.innerHTML = 'Loading...';


			if(_getData)
			{
				if(_footer)
					_footer.hide();

				_getData(_selectionSessionData,_this.update);
			}
		}

		if(_onShow)
			_onShow(isShow);
	}
	_this.setSessionData = function(sdata) //this gets passed back when done
	{
		_selectionSessionData = sdata;
		if(_footer)
			if(_footer.setSessionData)
				_footer.setSessionData(sdata);
	},
	_this.onDone = function()
	{
		if(_onDone)
			_onDone();
	}

	return _this;


},
BindInputsToData:function(params,data)
{

	var _this = this;

	"use strict";
	//private variables
	var model = {};
	var _data = data;
	var _css = params.css,
		_onChange = params.onChange,
		_onAdd = params.onAdd,
		_onDelete = params.onDelete;

	if(!_data)
		_data = {};

	var _allInputElms = {};
	var _allRowElms = {};


	//DOM elements / templates here
 	var _elm = cELM('div',_css);
 	if(params.template)
 		_elm.innerHTML = params.template;
 	else if(params.dom)
 		_elm = params.dom;


 	var _change = function(e){
 		var data_type = this.getAttribute('data-type');
 		var data_value = this.getAttribute('data-value')
 		var data_table_column = this.getAttribute('data-table-column');	
 		var type = this.type;

 		var source = this.source;
 		var rowIdx = this.rowIdx;
 		var column = this.column;

 		if(data_type == 'picker')
 		{
 			if(!_data[this.source])
 				_data[this.source] = [];

 			if(data_table_column)
 			{
	 			if(this.checked)
	 			{
	 				var rowData = {}
					rowData.guid = guidGenerator();
					rowData[data_table_column] = data_value;

	 				_data[this.source].push(rowData);

	 				//TODO add row if applicable
	 			}
	 			else
	 			{
	 				var removeIdx = -1;
	 				for(var i = 0; i < _data[this.source].length; i++)
	 				{
	 					var rowData = _data[this.source][i];
	 					if(rowData[data_table_column] == data_value)
	 						removeIdx = i;
	 				}

	 				_data[this.source].splice(removeIdx,1);

	 				//TODO remove
	 			} 		

 			}
 			else
 			{
	 			if(this.checked)
	 			{
	 				_data[this.source].push(data_value);
	 			}
	 			else
	 			{
	 				var removeIdx = -1;
	 				for(var i = 0; i < _data[this.source].length; i++)
	 				{
	 					var v = _data[this.source][i];
	 					if(v == data_value)
	 						removeIdx = i;
	 				}

	 				_data[this.source].splice(removeIdx,1);
	 			} 				
 			}


 			
 		}
		else
		{
			var dValue = null;
			if(type =='checkbox' || type == 'radio')
			{
				var groupname = this.getAttribute('name');
				if(groupname)
				{
					var relatedInputs = document.querySelectorAll('input[name="'+groupname+'"]');
					for(var ri = 0; ri < relatedInputs.length; ri++)
					{
						var relatedInput = relatedInputs[ri]
						var rSource = relatedInput.getAttribute('data-src');
						if(_data[rSource])
							_data[rSource] = false;
					}		
				}

				dValue = this.checked;
			}
			else
			{
				dValue = this.value;
			}


			if(rowIdx === undefined)
			{
				_data[this.source] = dValue;	
			}
			else
			{
				_data[this.source][rowIdx][column] = dValue;
			}
	
				
		}

		
		if(_onChange)
			_onChange(this.source,this); 		
 	}

 	var bindInput = function(element,data,attribute,prefixHash)
 	{
 		

 		var qi = "input["+attribute+"]";
 		var qt = "textarea["+attribute+"]";
 		var inputIn = element.querySelectorAll(qi);
		var inputText = element.querySelectorAll(qt);

		var inputs = [];

		for(var i = 0; i < inputIn.length; i++)
		{
			inputs.push(inputIn[i])
		}

		for(var i = 0; i < inputText.length; i++)
		{
			inputs.push(inputText[i])
		}

		for(var i = 0; i < inputs.length; i++)
		{
			var data_type = inputs[i].getAttribute('data-type');
			var data_value = inputs[i].getAttribute('data-value');
			var data_column = inputs[i].getAttribute('data-table-column');
			var type = inputs[i].type;
			var inp = inputs[i];
			var prop = inputs[i].getAttribute(attribute);

			inp.source = prop;
			inp.onchange = _change;
			inp.onkeyup = _change;
			
			//row items
			var refHash = inp.source;

			if(prefixHash) // for table data
			{
				var parts = prefixHash.split('|');
				var tb = parts[0];
				var rowIdx = parts[1];

				inp.source = tb;
				inp.rowIdx = rowIdx;
				inp.column = data_column;

				if(!_allInputElms[tb])
					_allInputElms[tb] = [];

				if(!_allInputElms[tb][rowIdx])
					_allInputElms[tb][rowIdx] = {};

				_allInputElms[tb][rowIdx][data_column] = inp;
								
				
			}
			else
			{
				if(data_column)
					if(data_column != prop)
					{
						refHash = refHash + '|'+data_column; 
					}

				if(data_value)
				{
					refHash = refHash + '|'+data_value; 
				}

				if(!_allInputElms[refHash])
				{
					_allInputElms[refHash] = inp;
									
				}
				else
				{
					if(attribute != 'data-table-column' && data_type ? data_type != 'picker' : false)
					{
						console.log('duplicate: '+refHash);
					}
				
				}				
			}



		}

 	}

 	var tables = _elm.querySelectorAll('div[data-format="table"]');
 	
 	var onAddRow = function(e,data,rowIdx)
 	{
		var rowData = {}
		rowData.guid = guidGenerator();	
		if(data)
			rowData = data;
		
		var idx = 0;
		if(rowIdx !== undefined)
		{
			idx = rowIdx;
		}
		else
		{
			if(_data[this.source])
				idx = _data[this.source].length;
		}


		var row = this.template.cloneNode(true);
		bindInput(row,rowData,'data-table-column',this.source+'|'+idx);
		row.guid = rowData.guid;

		if(!_allRowElms[this.source])
			_allRowElms[this.source] = [];

		_allRowElms[this.source][idx] = row;

		//clear template data
		for(var i = 0; i < row.childNodes.length; i++)
		{
			var r = row.childNodes[i];
			if(r.nodeName == "INPUT")
				r.value = null;
		}

		var btDelete = row.querySelector('div[data-control="delete"]');
		if(btDelete)
		{
			btDelete.template = row;
			btDelete.source = prop;
			btDelete.onclick = function(e)
			{
				if(this.template.parentNode)
					this.template.parentNode.removeChild(this.template);

				var d = _data[this.source];
				var deleteIdx = -1;
				for(var i = 0; i < d.length; i++)
				{
					var guid = d[i].guid
					if(guid)
					{
						if(guid == this.template.guid)
						{
							deleteIdx = i;
							break;
						}
					}
				}

				if(deleteIdx > -1)
				{
					_allInputElms[this.source].splice(deleteIdx,1);
					_data[this.source].splice(deleteIdx,1);
					//console.log(_data[this.source]);
					_onChange(this.source,this);
				}


			} 				
		}
		
		this.parentNode.insertBefore(row,this);
		
		if(!data)
		{
			//created new entry
			_data[this.source].push(rowData);
		}

 	}
 	
 	bindInput(_elm,_data,'data-src');

 	
 	for(var i = 0; i < tables.length; i++)
 	{
 		var tb = tables[i];
 		var prop = tb.getAttribute('data-src');
 		var rowTemplate = tb.querySelector('div[data-format="row"]');

 		var btAdd = tb.querySelector('div[data-control="add"]');
 		btAdd.template = rowTemplate;
 		btAdd.source = prop;
 		btAdd.onclick = onAddRow;

 		rowTemplate.parentNode.removeChild(rowTemplate);

 	
 		if(!_data[prop])
		{
			_data[prop] = [];
			btAdd.onclick();
		}
		else if (_data[prop].length == 0)
		{
			btAdd.onclick();	
		}
		else
 		{
			for(var k = 0; k < _data[prop].length; k++)
 			{
 				var d = _data[prop][k];
 				btAdd.onclick(null,d,k);
 			}
 		}

 	}

 	var _setInputValue = function(inp,dateInputValue)
 	{
 		var type = inp.type;
		var data_src = inp.getAttribute('data-src');
		var data_type = inp.getAttribute('data-type');
		var data_value = inp.getAttribute('data-value');
		var data_column = inp.getAttribute('data-table-column');
		
		if(data_type == 'picker')
		{
			inp.checked = true;
		}
		else if(type == 'checkbox' || type == 'radio')
		{
			inp.checked = dateInputValue;
		}
		else
		{
			inp.value = dateInputValue;
		}		
 	}

 	_this.update = function(dataSet)
 	{
 		//check to see if array elements needs to be synced
 		//_data = dataSet; @aaronrau, cannot break reference here for binding
 		for(var p in dataSet)
 		{
 			var updatedTables = dataSet[p];
 			if(Array.isArray(updatedTables))
 			{
 				var diff = updatedTables.length - _data[p].length;

 				//need to add elements from UI
				if(diff > 0)
				{
	 				for(var i = 0; i < tables.length; i++)
					{
						var tb = tables[i];
				 		var prop = tb.getAttribute('data-src');
				 		if(prop == p)
				 		{
					 		var btAdd = tb.querySelector('div[data-control="add"]');
					 		if(btAdd)
					 		{
					 			var l = updatedTables.length;
								for(var k = l-diff; k < updatedTables.length; k++)
					 			{
					 				var d = updatedTables[k];
					 				btAdd.onclick(null,d,k);
					 			}
					 		}

				 		}		
					}

				}//need to remove elements for UI
				else if(diff < 0)
				{
					var l = _allRowElms[p].length;
					for(var i = l + diff; i < Math.abs(l); i++)
					{
						var rowElm = _allRowElms[p][i];
						if(rowElm.parentNode)
							rowElm.parentNode.removeChild(rowElm);
					}

					for(var i = 0; i < Math.abs(diff);i++)
					{
						_allRowElms[p].splice(_allRowElms[p].length -1,1);	
					}
					
				}
 			}

 			_data[p] = dataSet[p];
 		}

 	
 		for(var prop in _data)
 		{
 			var value = _data[prop]; 	
 			if(Array.isArray(value))
 			{
 				
 				for(var i = 0; i < value.length; i++)
 				{
 					
 					var rowData = value[i];
 					var row = i;

 					if(_allInputElms[prop])
 						if(_allInputElms[prop][row])
	 					{
		 					for(var rProp in rowData)
		 					{
		 						var rowItemValue = rowData[rProp];
		 						var column = rProp;
		 						var pickerHash = prop+'|'+rProp+'|'+rowItemValue;
		 				
		 						if(_allInputElms[prop][row][column])
		 						{			
		 							_setInputValue(_allInputElms[prop][row][column],rowItemValue);
		 						}

		 						if(_allInputElms[pickerHash.trim()])
		 						{
		 							_setInputValue(_allInputElms[pickerHash.trim()],rowItemValue);
		 						}
		 					}
	 					}
 				}
 			}
 			else
 			{
 				var hash = prop;
 				
 				if(_allInputElms[hash])
 					_setInputValue(_allInputElms[hash],value);
 			}
 		}



 	}
	_this.getData = function()
	{
		return _data;
	}

	_this.getELM = function()
	{ //just returns the main element
		return _elm;
	}

	_this.getHTML = function()
	{ //build / render html elements here

		return _elm;
	}


	_this.update(_data);

	return _this;
},
/*Convert a model into a bunch of input fields*/
BindModelToInputs:function(className,model,mode,onChange)
{



	var elm = cELM('div',className);

	for(var prop in model)
	{
		if(mode == 'form' || mode == 'form_withLabel')
		{
			var isArray = false;
			if (Array.isArray)
			{
	    		if (Array.isArray(model[prop]))
	    			isArray = true;
	    	}
	    	else if( Object.prototype.toString.call( model[prop] ) === '[object Array]' )
	    		isArray = true;

	    	if(isArray)
	    		for(i = 0; i <  model[prop].length; i++)
	    		{

	    		}
		}
		else if(mode == 'data')
		{
			if(typeof model[prop] === "object")
			{
				for(subProp in model[prop])
				{
					
				}
			}
		}

	}

	return elm;
},
/*Popover buttons*/
ExpandButton:function(params){
		var ExpandButton ={}

		/*
		params = {
			button_text:'+',
			classname:'list_add',
			selections:[
				{
					classname:'btUpload',
					text:'Upload',
					detailText:'upload an existing list from the web',
					onclick:function(){}
				}
			];
		}
		*/


		//Private Property
		var _data = {};
		var _params = params;
		var _selections = [];

		var elm = cELM('div','button_expand '+ _params.classname);
	
		var main_button = cELM('div','button');
		main_button.innerHTML = params.button_text;

		var expand = cELM('div','expand');
		expand.style.display = 'none';

		var a1 = cELM('div','arrow_up1');
		expand.addELM(a1);
		var a2 = cELM('div','arrow_up2');
		expand.addELM(a2);

		var spacing = cELM('div','spacing');
		spacing.innerHTML = "";
		expand.addELM(spacing);

		for(var i = 0;i < params.selections.length;i++)
		{
			var d = params.selections[i];

			var button = cELM('div','section '+d.classname);
			button.onclick = d.onclick;

			var icon = cELM('div','icon');
			button.addELM(icon);

			var txt = cELM('div','text');
			txt.innerHTML = d.text;
			button.addELM(txt);

			var dtxt = cELM('div','detail_text');
			dtxt.innerHTML = d.detailText;
			button.addELM(dtxt);

			expand.addELM(button);
		}

		main_button.onclick = function(e)
		{
			if(app.controls.expandButtons)
			for(var i = 0; i < app.controls.expandButtons.length; i++)
			{
				if(app.controls.expandButtons[i] == expand)
				{
					continue;
				}
				app.controls.expandButtons[i].style.display = 'none';
			}

			if (!e) var e = window.event;
	        	e.cancelBubble = true;
	    	if (e.stopPropagation) e.stopPropagation();

			if(expand.style.display == 'none')
			{
				expand.style.display = 'block';
			}
			else
			{
				expand.style.display = 'none';
			}
		}

		ExpandButton.click = function(e)
		{
			main_button.onclick(e);
		}

		//document.body.appendChild(elm);


		ExpandButton.getHTML = function()
		{
			if(!app.controls.expandButtons)
				app.controls.expandButtons = [];

			app.controls.expandButtons.push(expand);

			document.body.addEventListener("click", function(e) {

				
				if (!e) var e = window.event;
	        	e.cancelBubble = true;
	    		if (e.stopPropagation) e.stopPropagation();

	    		expand.style.display = 'none'
			});
			
			elm.addELM(main_button);
			elm.addELM(expand);
		
			return elm;
		}


	return ExpandButton;
	},
/*--------------------*/
ProgressBar:function(params){
	var _this ={}
	var _params = params;

	var elm = cELM('div','progress');
	var bar = cELM('div','progress-bar');
	var barLabel = cELM('div','progress-bar-label');
	
	_this.update = function(percent)
	{
		bar.style.width = percent + '%';
		barLabel.innerHTML = percent + '%';
	}
	_this.getELM = function()
	{
		return elm;
	}
	_this.getHTML = function()
	{

		elm.addELM(bar);
		elm.addELM(barLabel);

	
		return elm;
	}

	return _this;
},
/*--------------------*/
Segment:function(params){
	var _this ={}
	var _params = params;

	var _elm = cELM('div','segments');
	
	var _segElms = [];
		

	var clearSelect = function()
	{
		for(var i = 0; i < _segElms.length; i++)
		{
			_segElms[i].className = "segment";
		}
	}


	if(_params.segments)
	{
	
	 	for(var i = 0; i < _params.segments.length; i++)
	 	{
	 		 var segD = _params.segments[i];
 
	 		 var sg = cELM('div','segment');

	 		 if(i == 0)
	 		 	sg.className = 'segment selected';

	 		 sg.innerHTML = segD.label;
	 		 sg.value = segD.value;
	 		 sg.onSelect = segD.onSelect;
	 		 sg.onclick = function(e){
	 		 	clearSelect();

				this.className = 'segment selected';
				this.onSelect(this.value);

	 		 }



	 		 _elm.addELM(sg);
	 		 _segElms.push(sg)

	 	}
	}	 

	_this.getELM = function()
	{ //just returns the main element
		return _elm;
	},
	_this.getHTML = function()
	{ //build / render html elements here

		return _elm;
	}

	return _this;
}

}});