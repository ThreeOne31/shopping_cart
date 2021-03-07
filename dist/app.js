/*---- Global Variable -----*/
const cartButton = document.querySelector(".cart-button");
const closeCartButton = document.querySelector(".close-cart");
const clearCartButton = document.querySelector(".clear-cart");
const cartDOM  = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotalBeforeTax = document.querySelector(".cart-total-b4-tax");
const cartTax = document.querySelector(".cart-tax");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-Content");
const productsDOM = document.querySelector(".products");

// cart initailisation
let cart = []

// buttons
let buttonsDOM = []

// getting products
class Products{
    async getProducts(){
        try {
            let result = await fetch("products.json")
            let data = await result.json()
            let products = data.items
            products = products.map(item => {
                const {title,price} = item.fields
                const {id} = item.sys
                const {image} = item.fields
                const imageUrl = image.fields.file.url
                return {title,price,id,imageUrl}
            })
            return products
        } catch (error) {
            console.log(error)
        }
    }
}

// display products
class UI{
    displayProducts(products){
        /* 
            A function to dynamicly display product from a local JSON file
            or from a remote server
        */
        let result = ''
        products.forEach(product => {
            result += `
            
                <li class="products-list">
                    <div class="product">
                        <a href="#">
                            <img class="product-image" src=${product.imageUrl} alt="product image">
                        </a>
                        <div class="product-name">
                            <a href="#">${product.title}</a>
                        </div>
                        <div class="product-price">R${product.price}</div>
                        <div class="product-buttons">
                            <button class="catelogue-add-to-cart banner-button" data-id=${product.id}>
                                <i class="fa fa-shopping-cart"> Add to Cart</i>
                            </button>
                        </div>
                    </div>
                </li>
            
        `
        })
        productsDOM.innerHTML = result
    }

    addToCartButtons(){
        /* 
            A function to handle Add-to-Cart button clicks
            Updating Card and button UIs
        */
        const addToCart =  [...document.querySelectorAll(".catelogue-add-to-cart")]
        buttonsDOM = addToCart

        addToCart.forEach(btn => {
            let id = btn.dataset.id
            let inCart = cart.find(item => item.id === id)
            if(inCart){
                buttonsDOM[id-1].innerHTML = 'In Cart'
                addToCart.disabled = true
            }
            
            else addToCart[id-1].addEventListener('click', event =>{

                buttonsDOM[id-1].innerHTML = 'In Cart'
                event.target.disabled = true

                // get product from products
                let cartItem = {...Storage.getProduct(id), itemCount:1} //return product object with matching id plus an extra element
                // add product to cart
                cart = [...cart, cartItem]
                // save cart to local storage
                Storage.saveCart(cart)  
                // set cart values
                this.setCartValues(cart)
                // display cart item
                this.addCartItem(cartItem)     
            })            
        }) 
    }
    setCartValues(cart){
        /* 
            Calcute Values: Number of products per cart item, total cart cost, tax additions
        */
        let taxRate = 0.15
        let tax = 0
        let totalBeforeTax = 0
        let priceTotal = 0
        let itemsTotal = 0
        cart.map(item => {
            totalBeforeTax += item.price * item.itemCount
            tax = totalBeforeTax*taxRate
            priceTotal = totalBeforeTax +tax
            itemsTotal += item.itemCount
        })
        cartTotalBeforeTax.innerHTML = `R${parseFloat(totalBeforeTax.toFixed(2))}`
        cartTax.innerHTML = `R${parseFloat(tax.toFixed(2))}`
        cartTotal.innerHTML = `R${parseFloat(priceTotal.toFixed(2))}`
        cartItems.innerHTML = itemsTotal
    }

   
    addCartItem(item){
        /*
            A function to handle cart content         
        */
        const div = document.createElement('div')
        div.classList.add('cart-item')
        div.innerHTML = `
            <img src=${item.imageUrl}>
            <div>
                <h4>${item.title}</h4>
                <h5>R${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
                <i class="fa fa-chevron-up" data-id=${item.id}></i>
                <p class="items-count">${item.itemCount}</p>
                <i class="fa fa-chevron-down" data-id=${item.id}></i>
            </div>
        `
        cartContent.appendChild(div)
    }
    showCart(){
        /*
            A fuction to make the cart visible; default cart is hidden
        */
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('showCart')
    }
    setupAPP(){
        /*
            Set the application state
        */
        // retrieve the current cart state
        cart =Storage.getCart()
        // update cart values from the current cart state
        this.setCartValues(cart)
        // populate the cart with the current cart state
        this.populateCart(cart)
        // add event listeners
        cartButton.addEventListener('click', this.showCart)
        closeCartButton.addEventListener('click', this.hideCart)
    }
    populateCart(cart){
        /*
            A fucntion to populate the cart based on current cart state
        */
        cart.forEach(item => this.addCartItem(item))
    }
    hideCart(){
        /*
            UI control, tricked by eventListener
        */
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('showCart')
    }
    cartLogic(){
        // clear cart button
        clearCartButton.addEventListener('click', () => {this.clearCart()})
        // cart functions
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains("remove-item")){
                let removeItem = event.target
                let id = removeItem.dataset.id
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id)
            }
            else if (event.target.classList.contains("fa-chevron-up")){
                let addItemCount = event.target
                let id = addItemCount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.itemCount += 1
                Storage.saveCart(cart)
                this.setCartValues(cart)
                addItemCount.nextElementSibling.innerText = tempItem.itemCount
            }
            else if (event.target.classList.contains("fa-chevron-down")){
                let lowerItemCount = event.target
                let id = lowerItemCount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.itemCount -= 1
                if(tempItem.itemCount > 0){
                    Storage.saveCart(cart)
                    this.setCartValues(cart)
                    lowerItemCount.previousElementSibling.innerText = tempItem.itemCount
                }
                else{
                    cartContent.removeChild(lowerItemCount.parentElement.parentElement)
                    this.removeItem(id)
                }
              
            }
        })
    }
    clearCart(){
        /* Clear all cart elements */
        
    
        let cartItems = cart.map(item => item.id)
        cartItems.forEach(id => this.removeItem(id))
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
        // hide the cart when its clear
        this.hideCart()
        
    }
    removeItem(id){
        /*
            A function remove cart items by id
        */
        // lookup id to be removed
        cart =cart.filter(item => item.id != id)
        // update the cart UI and storage
        this.setCartValues(cart)
        Storage.saveCart(cart)
        let button = this.getSingleButton(id)
        button.disabled = false
        button.innerHTML = `<i class="fa fa-shopping-cart"> Add to Cart</i>`
    } 
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id)
    }
}
// local storage
class Storage{
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products))
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(item => item.id === id)
    }
    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI()
    const products = new Products()

    // setup App
    ui.setupAPP()
    //get all products
    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then(() => {
        ui.addToCartButtons()
        ui.cartLogic()
    })
})


function openMenu(){
    document.querySelector(".side-menu").classList.add("open")
}
function closeMenu(){
    document.querySelector(".side-menu").classList.remove("open")
}