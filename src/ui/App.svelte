<script lang="ts">
    import "./app.css";
    import cloneDeep from 'lodash.clonedeep';

    const serverUrl = "http://localhost:3001";
    let nodes = {};

    const processImages = async () => {

        let nodesForTransport = cloneDeep(nodes);

        for (let size in nodesForTransport) {
            nodesForTransport[size].forEach(n => {
                if ('image' in n){

                const formData = new FormData();
                formData.append('username', 'Chris');
                formData.append('image', new Blob([n.image], {type: '"application/octet-stream"'}), n.img);

                let xhrImage = new XMLHttpRequest();
                xhrImage.open("POST", `${serverUrl}/image`, false);
                xhrImage.send(formData);
                xhrImage.onload = () => {
                    //let response = JSON.parse(xhrImage.response);
                };

                delete n.image;
                } 
            });
        }

        return nodesForTransport;
        }

    const openPreview = async () => {

        const nodesForTransport = await processImages();

        // first node is the screensize frame, so the second one is the actual first HTML element
        for (let size in nodesForTransport) {
            nodesForTransport[size][1].parent = false;
        };

        //console.log(nodesForTransport);

        const xhrNodes = new XMLHttpRequest();
        xhrNodes.open("POST", `${serverUrl}/p`, true);
        xhrNodes.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhrNodes.send(JSON.stringify(nodesForTransport));
        xhrNodes.onload = () => {
            let response = JSON.parse(xhrNodes.response);
            window.open(`${serverUrl}${response.preview}`, '_blank');
        };
    }

    onmessage = (event) => {
        if ('err' in event.data.pluginMessage) console.log("message", event.data.pluginMessage);
        else {
            nodes = event.data.pluginMessage;
            console.log(nodes);
            openPreview();
        }
    };
</script>
<h1>Hello world</h1>