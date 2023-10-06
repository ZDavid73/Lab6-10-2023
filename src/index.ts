import "./components/export"

class AppContainer extends HTMLElement {
    constructor(){
        super();
        this.attachShadow({ mode: "open" })
    }

    connectedCallback(){
        if(this.shadowRoot)
        this.shadowRoot.innerHTML = `
        <card-component></card-component>
        `
    }
}

customElements.define('app-container', AppContainer)


