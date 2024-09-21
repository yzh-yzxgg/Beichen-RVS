<template>
  <UiDialog>
    <UiDialogTrigger as-child>
      <slot />
    </UiDialogTrigger>
    <UiDialogContent class="w-[92vw] rounded-md">
      <UiDialogHeader>
        <UiDialogTitle class="text-xl font-bold text-start">
          关于我们
        </UiDialogTitle>
      </UiDialogHeader>
      <div class="flex flex-col my-2">
        <NuxtImg src="/logo.svg" class="mx-auto mb-4 w-[50%]" />
        <section class="prose">
          <p>
            <em>Beichen Radio Vote Sys </em> 是由<b> PioneerAsso </b>为东营市第一中学<b>北辰广播站</b>开发的一体化系统，包含歌曲投稿，歌曲审核，一键排歌，导出歌单等功能。
          </p>
          <p>
            这个项目的代码是开源的，你可以在
            <NuxtLink to="https://github.com/yzh-yzxgg/Beichen-RVS" class="font-bold">
              <span>这里</span>
            </NuxtLink>
            查看源代码。期待各位同学的反馈！
          </p>
          <p>
            策划：<b>闫子寒 (
              <NuxtLink to="https://github.com/yzh-yzxgg" class="font-bold">
                yzxgg
              </NuxtLink>
            ) 、石镇华、燕睿哲</b> | logo 设计：<b>燕睿哲。</b><br>

            制作&运营：<b>闫子寒。</b><br>
          </p>
          <p>
            特别的，项目开发使用了部分深圳中学风华子衿广播站 fm1063 线上点歌系统的开源代码 ，谨代表市一中全体开发人员对深圳中学学生无私奉献的开源精神表示由衷感谢！
          </p>
          <p>
            <b> PioneerAsso </b>是市一中学生首创的社团间合作组织，包括光影摄影协会、北辰广播站骨干成员，旨在通过合作实现学生创新项目
          </p>
        </section>
      </div>
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
