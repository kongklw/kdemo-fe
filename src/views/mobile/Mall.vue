<template>
  <div class="mobile-mall">
    <van-nav-bar title="商城" fixed placeholder />

    <van-search placeholder="搜索商品" shape="round" />

    <van-grid :column-num="2" :gutter="10" class="product-grid">
      <van-grid-item v-for="item in products" :key="item.id">
        <van-image :src="item.image" height="120" fit="cover" />
        <div class="product-info">
          <div class="product-title">{{ item.title }}</div>
          <div class="product-price">¥ {{ item.price }}</div>
        </div>
      </van-grid-item>
    </van-grid>
  </div>
</template>

<script>
export default {
  data() {
    return {
      products: [
        { id: 1, title: '婴儿奶粉', price: '298.00', image: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
        { id: 2, title: '纸尿裤', price: '128.00', image: 'https://img.yzcdn.cn/vant/apple-2.jpg' },
        { id: 3, title: '婴儿车', price: '1299.00', image: 'https://img.yzcdn.cn/vant/apple-3.jpg' },
        { id: 4, title: '益智玩具', price: '59.00', image: 'https://img.yzcdn.cn/vant/apple-4.jpg' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-mall {
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 50px;
}

.product-grid {
    padding: 10px;
}

.product-info {
    text-align: left;
    width: 100%;
    margin-top: 8px;

    .product-title {
        font-size: 14px;
        color: #333;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .product-price {
        font-size: 16px;
        color: #ee0a24;
        font-weight: bold;
    }
}
</style>
