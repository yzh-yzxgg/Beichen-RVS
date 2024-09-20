<template>
  <UiDialog>
    <UiDialogTrigger as-child>
      <slot />
    </UiDialogTrigger>
    <UiDialogContent class="w-[92vw] rounded-md">
      <UiDialogHeader>
        <UiDialogTitle class="text-xl font-bold text-start">
          规则介绍
        </UiDialogTitle>
      </UiDialogHeader>
      <UiScrollArea class="h-[50vh] sm:h-auto">
        <div class="prose">
          <ol>
            <li>歌曲内容务必积极向上，充满正能量，适合在校园内播放，北辰广播站有权对歌曲进行筛选</li>
            <li>会控制每天的歌曲风格，使各个风格的歌曲平均分配，因此有部分通过审核的歌曲不会播放</li>
            <li>每人每天最多投稿 1 首歌曲</li>
            <li>不支持买断制音乐 如付费专辑音乐</li>
            <li>因节目安排变化，部分歌曲可能无法播出，恕不另行通知</li>
            <li>歌单仅供参考，歌曲播出顺序按实际为准</li>
            <li>最终审核解释权由北辰广播站所有</li>
          </ol>
        </div>
      </UiScrollArea>
      <UiDialogFooter>
        <UiDialogClose as-child>
          <UiButton type="button" variant="secondary" class="ml-auto px-6">
            好的
          </UiButton>
        </UiDialogClose>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
