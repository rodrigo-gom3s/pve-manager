Ext.define('PVE.window.NHAPVEAI', {
    extend: 'Ext.window.Window',
    width: 800,
    height: 600,
    title: gettext('PVE AI - Proxmox VE AI'),
    iconCls: 'fa fa-question',
    modal: true,
    bodyPadding: 10,
    resizable: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
        {
            xtype: 'textarea',
            itemId: 'chatDisplay',
            readOnly: true,
            flex: 1,
            value: '',
            scrollable: true,
            style: {
                backgroundColor: '#f9f9f9'
            }
        },
        {
            xtype: 'textfield',
            itemId: 'userInput',
            enableKeyEvents: true,
            emptyText: 'Escreve a tua pergunta...',
            listeners: {
                specialkey: function(field, e) {
                    if (e.getKey() === e.ENTER) {
                        this.up('window').sendMessage();
                    }
                }
            }
        }
    ],

    bbar: [
        '->',
        {
            xtype: 'button',
            text: 'Enviar',
            iconCls: 'fa fa-paper-plane',
            handler: function(btn) {
                btn.up('window').sendMessage();
            }
        }
    ],

    sendMessage: function() {
        const win = this;
        const inputField = win.down('#userInput');
        const chatDisplay = win.down('#chatDisplay');
        const userMessage = inputField.getValue();

        if (!userMessage) return;

        chatDisplay.setValue(chatDisplay.getValue() + '\nYou: ' + userMessage + '\n\n');
        inputField.setValue('');

        Ext.Ajax.request({
            url: 'https://pve-llm.duckdns.org/api/generate', 
            method: 'POST',
         jsonData: {
                model: 'huihui_ai/llama3.2-abliterate:latest',
                prompt: userMessage,
                system: "You are an expert in server infrastructure and virtualization. You answer technical questions about Proxmox VE, a platform based on KVM, LXC, and ZFS, focusing on: Configuration and management, Backup, Networking and storage, Advanced high availability (HA) and migration features. New interface element: \"ProxmoxNG Control\" menu. A new interface item has been added next to the \"Documentation\" button, called \"ProxmoxNG Control\", which includes three options: 1) \"HA - Shutdown\": opens a window with the option \"Enable Migrate on Shutdown\". When enabled, the cluster's shutdown policy changes to migrate, allowing scheduled shutdowns to automatically migrate VMs to another node. 2) \"HA - Fault Tolerance\": displays a table called \"Available Virtual Machines\" with the VMs in HA groups. Each VM has a checkbox indicating whether it is enabled for fault tolerance. Checking the VMs and just clicking on the button \"Proceed\" at the bottom of the window adds them to the snapshot-based failover feature. 3) \"Remote Migration\": allows VM migration between clusters. The user must select the source node and VM, then fill out 7 fields: destination host IP, admin username (e.g., root@pam), API token name, API token secret, cluster fingerprint, target storage, and bridge interface. The interface also allows the creation or import of migration configurations via the \"Import / Export Migration Configs\" dropdown. To create a config, the user fills in the necessary fields and downloads a JSON file with a token, which can later be imported using the corresponding option. You can only answer to questions that you know the answer to. Do not write information to user that you are not sure. If you don't know the answer, say 'I don't know'. You also need to answer in the same language as the question asked. Answer to the question only whit the steps needed to solve the problem, do not write any additional information.",
                stream: false
        },
            success: function(response) {
                let result = JSON.parse(response.responseText);
                console.log(result);
                result = result.response;
                const aiReply = result || '[NO RESPONSE]';
                chatDisplay.setValue(chatDisplay.getValue() + 'AI: ' + aiReply + '\n');
            },
            failure: function(response) {
                Ext.Msg.alert('Error', 'Connection to assistent failed.');
            }
        });
    }
});
