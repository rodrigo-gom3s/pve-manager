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
    deamonsocket: 'deamonFT',

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
                        const vms = selected.map(vm => vm.data);
                        console.log(vms);
                        // Your API call here  
                        Ext.Ajax.request({
                            url: 'http://deamonFT:5000/rest/faulttolerance',
                            method: 'POST',
                            jsonData: { vms: vms },
                            success: function(response) {
                                Ext.Msg.alert('Success', 'Fault tolerance enabled for selected VMs');
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
                    // Your API call here
                    Proxmox.Utils.API2Request({
                        url: '/cluster/resources',
                        params: {
                            type: 'vm',
                        },
                        method: 'GET',
                        success: function(response) {
                            win.getStore().loadData(response.result.data);
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
