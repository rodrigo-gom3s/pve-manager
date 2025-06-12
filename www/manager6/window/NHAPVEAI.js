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

        chatDisplay.setValue(chatDisplay.getValue() + '\nVocê: ' + userMessage + '\n\n');
        inputField.setValue('');

        Ext.Ajax.request({
            url: 'https://pve-llm.duckdns.org/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAn3s01_UHwqO8VnyQy1MbYbtuLpdRJvVE', 
            method: 'POST',
            credentials: 'omit',
         jsonData: {
            contents: [{
                parts: [{
                    text: "You are an expert in server infrastructure and virtualization. Your task is to answer questions about Proxmox VE, a virtualization platform based on KVM, LXC, and ZFS. Provide clear, technical, and helpful answers regarding configuration, management, backup, networking, storage, and other Proxmox VE-related topics. You also have a new feature not present in the traditional interface. To the left of the 'Documentation' button, there is a dropdown menu labeled 'ProxmoxNG Control' with the following options: 'HA - Shutdown', which opens a page with a checkbox to enable or disable VM migration when a node shutdown is requested by an administrator; 'HA - Fault Tolerance', which opens a window where the user can select VMs managed by the fault tolerance feature (on boot, VMs in fault tolerance will recover their previous state saved by the feature’s snapshots); 'Remote Migration', where the user selects the node and VM to migrate, then fills in 7 fields: destination host IP, admin username of the target cluster (e.g., root@pam), API token name, API token secret, cluster fingerprint, target storage for the VM disk, and virtual bridge interface for migration. The user can also create and import remote migration configuration files in the 'Remote Migration' window using a dropdown at the bottom. To create a config file, the user selects the target node, destination storage, bridge interface, and inputs the host’s public IP. Upon creation, the browser downloads a JSON file with a token that can be imported later via the interface. Answer the following question as concisely and unambiguously as possible, including only the necessary steps and using the same language the question is asked in:\n\nQuestion: " + userMessage
                }]
            }],
        },
            success: function(response) {
                let result = JSON.parse(response.responseText);
                result = result.candidates[0].content.parts[0].text;
                const aiReply = result || '[NO RESPONSE]';
                chatDisplay.setValue(chatDisplay.getValue() + 'AI: ' + aiReply + '\n');
            },
            failure: function(response) {
                console.error('AI request failed:', response);
                Ext.Msg.alert('Error', 'Connection to assistent failed.');
            }
        });
    }
});
