import { reqShopCartList, reqDeleteCartById, reqUpdateCartChecked } from '@/api';

import { userTemp } from '@/utils/temp_token'

const state = {
    userTempId: userTemp(),
    shopList: []
};
const mutations = {
    GETSHOPCART(state, shopList) {
        state.shopList = shopList;
    }
};
const actions = {
    //获取购物车数据的方法
    async getShopCart({ commit }) {
        let result = await reqShopCartList();
        console.log(result)
        if (result.code == 200) {
            commit('GETSHOPCART', result.data);
        }
    }
    ,
    //删除某一个产品的操作
    async deleteCart({ commit }, skuId) {
        let result = await reqDeleteCartById(skuId);
        if (result.code == 200) {
            return 'ok';
        } else {
            return Promise.reject(new Error('faile'));
        }

    }
    ,
    //修改某一个产品的选中为选中状态
    async updateChecked({ commit }, { skuId, isChecked }) {
        let result = await reqUpdateCartChecked(skuId, isChecked);
        //修改成功
        if (result.code == 200) {
            return 'ok';
        } else {
            return Promise.reject(new Error('faile'));
        }
    }
    ,
    //修改全部的产品的选中状态的方法
    //在action当中如何获取到仓库中的存储的数据
    //1:获取到全部购物车的数据【数组：六个元素】
    //2:触发updateChecked这个action六次【全部产品都修改了】
    //3:updateAllCart,返回一个Promise，告诉组件成功了，还是败了【组件才能继续写别的业务】
    updateAllCart({ getters, dispatch}, isChecked) {
        //minStore：获取仓库中的state、计算属性getters
        //minStore: disptach方法可以派发action
        //commit:提交mutation，修改state
        //遍历购物车里面产品：购物车里面有多少产品，回调就执行多少次
        let arr = [];
        getters.shopCartData.cartInfoList.forEach(cart => {
            //在当前action内部，调用顶部action执行N次
            let promise = dispatch('updateChecked', { skuId: cart.skuId, isChecked });
            arr.push(promise);
        })

        //如果不书写return，返回结果永远undefined，永远是真
        //Promise.all执行,参数需要的是一个数组，数组里面每一个都是promise，如果都成功，promise返回即为成功结果
        //如果有一个【修改状态】promise失败返回的结果即为失败
        return Promise.all(arr);//可以保证 updateAllCart返回的是promise【成功、失败】
    }
    ,
    //删除选中的全部商品
    deleteCartByChecked({ getters, dispatch }) {
        //获取购物车里面全部商品进行遍历
        let arr = [];
        getters.shopCartData.cartInfoList.forEach(item => {
            if (item.isChecked == 1) {
                let promise = dispatch("deleteCart", item.skuId);
                arr.push(promise);
            }
        });

        return Promise.all(arr);
    }

};
const getters = {
    //简化购物车的数据
    //当前购物车模块的state，并非大仓库的state数据【只是包含购物车state数据】
    shopCartData(state) {
        return state.shopList[0] || {}
    }
};
export default {
    state,
    mutations,
    actions,
    getters
}