Ext.define('catcher.model.Tournament', {
  extend: 'Ext.data.Model',
  config: {
	  idProperty: 'item_id',
	    fields: [
	      {name: 'tournament_id', type: 'int'},
	      {name: 'tournament_name', type: 'string'}
	  ]
	}
});