<template>
  <div class="mobile-ai">
    <van-nav-bar title="AI Park" fixed placeholder />

    <van-grid :column-num="2" :gutter="10" clickable class="ai-grid">
      <van-grid-item icon="chat-o" text="Langchain Chat" to="/mobile/functions/langchain" />
      <van-grid-item icon="photo-o" text="Image Generation" />
      <van-grid-item icon="music-o" text="Voice Assistant" />
      <van-grid-item icon="video-o" text="Video Creator" />
    </van-grid>

    <van-empty description="更多 AI 功能即将上线" />
  </div>
</template>

<style scoped>
.mobile-ai {
  background-color: #f7f8fa;
  min-height: 100vh;
}
.ai-grid {
    padding-top: 10px;
}
</style>
