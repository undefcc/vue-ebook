/* eslint-disable */
const store = {
    state: {
        hotSearchOffsetY: 0,
        flapCardVisible: false,
        isEditMode: false,// 是否进入编辑模式
        shelfList: [],// 书架图书列表
        shelfSelected: [],// 书架选中图书列表
        shelfTitleVisible: true,// 书架标题是否显示（搜索框）
        shelfCategory: [],// 书架分类列表数据
        currentType: 1// 1代表书架列表，2代表书架分类列表
    },
    mutations: {
        'SET_HOT_SEARCH_OFFSETY': (state, offsetY) => {
            state.hotSearchOffsetY = offsetY
        },
        'SET_FLAP_CARD_VISIBLE': (state, visible) => {
            state.flapCardVisible = visible
        },
        SET_IS_EDIT_MODE(state, isEditMode) {
          state.isEditMode = isEditMode
        },
        SET_SHELF_LIST(state, list) {
          state.shelfList = list
        },
        SET_SHELF_SELECTED(state, selected) {
          state.shelfSelected = selected
        },
        SET_SHELF_TITLE_VISIBLE(state, visible) {
          state.shelfTitleVisible = visible
        },
        SET_SHELF_CATEGORY(state, category) {
          state.shelfCategory = category
        },
        SET_CURRENT_TYPE(state, type) {
          state.currentType = type
        }
    }
}

export default store
