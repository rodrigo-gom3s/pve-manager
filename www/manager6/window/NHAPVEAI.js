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

        chatDisplay.setValue(chatDisplay.getValue() + '\nVocê: ' + userMessage + '\n');
        inputField.setValue('');

        Ext.Ajax.request({
            url: 'https://pve-llm.duckdns.org/api/generate', 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            jsonData: {
                model: 'llama3.2:1b',
                prompt: userMessage + "\n És um assistente de IA especializado em Proxmox VE. Responde às perguntas dos utilizadores com precisão e clareza na lingua de origem.",
                stream: false
            },
            success: function(response) {
                const result = JSON.parse(response.responseText);
                const aiReply = result.response || '[Sem resposta]';
                chatDisplay.setValue(chatDisplay.getValue() + 'AI: ' + aiReply + '\n');
            },
            failure: function(response) {
                chatDisplay.setValue(chatDisplay.getValue() + 'Erro: falha ao contactar o assistente.\n');
            }
        });
    }
});
