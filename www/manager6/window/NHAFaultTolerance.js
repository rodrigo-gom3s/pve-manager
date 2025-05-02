Ext.define('PVE.window.NHAFaultTolerance', {
    extend: 'Ext.window.Window',
    width: 800,
    height: 500,
    title: gettext('HA - Fault Tolerance'),
    iconCls: 'fa fa-refresh',
    modal: true,
    bodyPadding: 10,
    resizable: true,
    layout: 'fit',

    items: [
        {
            xtype: 'gridpanel',
            itemId: 'grid',
            reference: 'vmGrid',
            title: gettext('Available Virtual Machines'),
            flex: 1,
            store: {
                xtype: 'store',
                autoLoad: true,
                fields: ['vmid', 'name', 'status', 'node'],
            },
            columns: [
                { text: 'VMID', dataIndex: 'vmid', width: 80 },
                { text: 'Name', dataIndex: 'name', flex: 1 },
                { text: 'Status', dataIndex: 'status', width: 100 },
                { text: 'Node', dataIndex: 'node', width: 100 },
            ],
            viewConfig: {
                emptyText: '<div style="display:flex;justify-content:center;align-items:center;height:100%;width:100%;color:#666;font-size:14px;">No data available.</div>',
                deferEmptyText: false
            },
            selModel: {
                selType: 'checkboxmodel',
                mode: 'MULTI',
            },
            buttons: [
                {
                    text: gettext('Proceed'),
                    iconCls: 'fa fa-check',
                    handler: function(btn) {
                        const grid = btn.up('window').down('grid');
                        const selected = grid.getSelection();
                        const vms = selected !== null && selected !== undefined ? selected.map(vm => 'qemu/'+vm.data.vmid) : [];
                        Ext.Ajax.request({
                            url: 'https://pveha.duckdns.org:5000/rest/faulttolerance',
                            method: 'POST',
                            jsonData:  vms,
                            success: function(response) {
                                Ext.Msg.show({
                                    title:'Fault Tolerance Enabled',
                                    msg: 'Fault tolerance settings has been changed for selected VMs',
                                    buttons: Ext.Msg.OK,
                                    animEl: 'elId',
                                    icon: Ext.MessageBox.INFO
                                 });
                            },
                            failure: function(response) {
                                Ext.Msg.alert('Error', 'Failed to enable fault tolerance: ' + response.htmlStatus);
                            }
                        });
                    },
                },
            ],
            listeners: {
                afterrender: function(win) {
                    let vms_returned = [];
                    Proxmox.Utils.API2Request({
                        url: '/cluster/resources',
                        params: {
                            type: 'vm',
                        },
                        method: 'GET',
                        success: function(response) {
                            //vm:100
                            Proxmox.Utils.API2Request({
                                url: '/cluster/ha/resources',
                                params: {
                                    type: 'vm',
                                },
                                method: 'GET',

                            success: function(response2) {
                                // response2 -> /cluster/ha/resources
                                // response -> /cluster/resources

                                Ext.Ajax.request({
                                    url: 'https://pveha.duckdns.org:5000/rest/faulttolerance',
                                    method: 'GET',
                                    success: function(response3) {
                                        response2.result.data.forEach((element) => {
                                            response.result.data.forEach((element2) => {
                                                if (element2.vmid === Number(element.sid.split(':')[1])) {
                                                    vms_returned.push({
                                                        vmid: element2.vmid,
                                                        name: element2.name,
                                                        status: element2.status,
                                                        node: element2.node,
                                                    });
                                                }
                                            })
                                        }
                                        )
                                        if(Number(vms_returned.length) === 0){
                                            Ext.Msg.show({
                                                title:'Fault Tolerance',
                                                msg: 'No VMs available for Fault Tolerance',
                                                buttons: Ext.Msg.OK,
                                                animEl: 'elId',
                                                icon: Ext.MessageBox.INFO
                                             });
                                        }
                                        let faultTolerance_VMS = response3.responseText;
                                        faultTolerance_VMS = JSON.parse(faultTolerance_VMS);
                                        win.getStore().loadData(vms_returned);
                                        var selectionModel = win.getSelectionModel();
                                        faultTolerance_VMS.forEach((element) => {
                                            vms_returned.forEach((element2) => {
                                                if (Number(element2.vmid) === Number(element.split('/')[1])) {
                                                    selectionModel.select(selectionModel.getStore().getRange().find( (record) => record.data.vmid === element2.vmid), true, true);
                                                }
                                            });
                                        });
  
                                    },
                                    failure: function(response3) {
                                        Ext.Msg.alert('Error', 'API call failed');
                                    }
                                });
                            },
                            failure: function(response2) {
                                Ext.Msg.alert('Error', 'API call failed: ' + response2.htmlStatus);
                            }});

                        },
                        failure: function(response) {
                            Ext.Msg.alert('Error', 'API call failed: ' + response.htmlStatus);
                        }
                    });
                }
            
            }
        },
    ],
});
