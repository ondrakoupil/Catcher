Ext.define('catcher.controller.Login', {
  extend: 'Ext.app.Controller',

  config: {
    refs: {
    	loginForm: 'loginPanel'
  	},
  	control: {
      'loginPanel button': {
        tap: 'doLogin'
      },
      "#logout": {
				tap: "doLogout"
			}
    }
  },
  
  doLogout: function(){
  	Ext.Msg.confirm("Odhlášení","Opravdu se chcete odhlásit?",
			function(response){
				if(response == "yes"){
					Ext.Msg.alert("Not implemented yet");
// 						Ext.Viewport.remove({
// 							xtype: "tournamentPanel"
// 						});
// 						Ext.Viewport.animateActiveItem("main",{type:"slide",direction:"right"});
// 					var store = Ext.data.StoreManager.lookup("Session");
// 					var device = Ext.device.Device.uuid;
// 					store.remove(store.findRecord("uuid",device));
// 					Ext.Msg.alert("Zařízení odhlášeno ze správy");
// 					Ext.getCmp("deletePlayer").destroy();
// 					Ext.getCmp("addPlayer").destroy();
// 					Ext.getCmp("logout").destroy();
// 					Ext.Viewport.animateActiveItem("main",{type:"slide",direction:"right"});
				}
			}
		);
	},
  
  doLogin: function() {
  	Ext.Viewport.setMasked({xtype:'loadmask',message:'Přihlašuji', indicator: true});
    var form = this.getLoginForm();
		values = form.getValues(true,true);				
		form.submit({
			success: function(form, response){
				var store = Ext.data.StoreManager.lookup("Session");
				var device = Ext.device.Device.uuid;
				var save = {
					uuid: device,
					tournament_id: response.tournament_id,
					tournament_name: response.tournament_name,
					match_id : 0,
					timestamp_logged: Date.now()
				};							
				store.add(device,save);
				Ext.Viewport.add({
					xtype: "tournamentPanel"
				});
				Ext.Viewport.animateActiveItem("tournamentPanel",{type:"slide",direction:"left"});
				Ext.Viewport.setMasked(false);			
			},
			failure: function(form, result, response){
				Ext.Viewport.setMasked(false);
				Ext.Msg.alert("Nepřihlášen",result.message);
			}
		});
	}		  
});