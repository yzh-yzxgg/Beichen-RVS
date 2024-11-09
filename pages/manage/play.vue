<script setup lang="ts">
import {
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
  Plus,
  Trash2,
  X,
} from 'lucide-vue-next';
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';
import dayjs from 'dayjs';
import { VueDraggable } from 'vue-draggable-plus';
import { getDateString } from '~/lib/utils';
import type { TArrangementList, TSong, TSongList, TStatus } from '~/types';

const { $api, $toast } = useNuxtApp();

definePageMeta({
  pageTransition: {
    name: 'slide-up',
    mode: 'out-in',
  },
});

useHead({
  title: '播放歌曲 | 北辰广播站点歌系统',
  meta: [
    { name: 'description', content: '北辰广播站点歌系统.' },
  ],
});

const userStore = useUserStore();
const isDesktop = ref(true);

const songList = ref<TSongList>([]);
const arrangementList = ref<TArrangementList>([]);

try {
  await $api.user.tokenValidity.query();
  songList.value = await $api.song.listUnused.query() ?? [];
  arrangementList.value = await $api.arrangement.list.query() ?? [];
} catch (err) {
  navigateTo('/manage/login');
}



type TArrange = 'day' | 'week';
const autoArrangeScopeText = {
  day: '一天',
  week: '一周',
};
const autoArrangeScopeLength = ref<TArrange>(userStore.autoArrange);

const showActions = ref(false);

const showArrangeScope = ref(false);
const arrangeScope = computed(() => {
  let maxDate = dayjs();
  for (const arrangement of arrangementList.value) {
    const d = dayjs(arrangement.date);
    maxDate = maxDate > d ? maxDate : d;
  }

  let startDate = maxDate;
  if (autoArrangeScopeLength.value === 'week')
    startDate = maxDate.add(maxDate.day() === 0 ? 0 : 1, 'w').startOf('w').add(1, 'd');
  else
    startDate = maxDate.add(1, 'd');
  const endDate = autoArrangeScopeLength.value === 'week' ? startDate.endOf('w').subtract(1, 'd') : startDate;

  return {
    start: startDate,
    end: endDate,
  };
});

const date = ref(new Date());
const dateString = computed(() => getDateString(date.value));
const arrangement = computed(
  () => arrangementList.value.find(e => e.date === dateString.value),
);


const calendarAttr = computed(() => {
  const res = [];
  for (const arrangement of arrangementList.value) {
    let dotColor = 'orange';
    if (arrangement.songs.length === 0)
      dotColor = 'gray';
    else if (arrangement.songs.length < 10)
      dotColor = 'orange';
    else
      dotColor = 'green';

    res.push({
      dot: {
        style: {
          backgroundColor: dotColor,
        },
      },
      dates: new Date(arrangement.date),
    });
  }

  if (showArrangeScope.value) {
    res.push({
      highlight: {
        start: { fillMode: 'outline', color: 'blue' },
        base: { fillMode: 'light', color: 'blue' },
        end: { fillMode: 'outline', color: 'blue' },
      },
      dates: {
        start: arrangeScope.value.start.toDate(),
        end: arrangeScope.value.end.toDate(),
      },
    });
  }
  return res;
});



const { copy: useCopy } = useClipboard({ legacy: true });
const [songInfoOpen, toggleSongInfoOpen] = useToggle(false);
const songInfo = ref('');

onMounted(async () => {
  // @ts-expect-error window
  isDesktop.value = window.innerWidth > 800 && window.innerHeight > 600;
  try {
    try {
      await $api.user.tokenValidity.query();
    } catch (err) {
      navigateTo('/manage/login');
    }
  } catch (err) {
    useErrorHandler(err);
  }
});
const selectedSong = ref<TSong>();
const searchLoading = ref(false);
const searchListCache = ref<Map<string, any>>(new Map());
const searchList = ref();
const tempList = ref();
async function setSearchList() {
  searchLoading.value = true;
  tempList.value = await getSearchList(selectedSong.value);
  searchList.value = tempList.value;
  console.log(searchList);
  searchLoading.value = false;
}
async function getSearchList(song?: TSong) {
  // Use cache
  const name = `${song?.name ?? ''} ${song?.creator ?? ''}`;
  const mapVal = searchListCache.value.get(name);
  if (mapVal)
    return mapVal;

  const formData = new FormData();
  formData.append('input', name);
  formData.append('filter', 'name');
  formData.append('type', 'netease');
  console.log(name);
  const results: any[] = [];
  for (let i = 1; i <= 2; i++) {
    const res: any = (await useFetch(`https://api.lolimi.cn/API/qqdg/?word=${name}&n=${i}`)).data._rawValue;
    results.push(res.data);
  }
  console.log(results); // 输出包含2个请求结果的数组
  // Store cache
  const data = results;
  console.log(data);
  searchListCache.value.set(name, data);
  return data;
};
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-3 lg:gap-5 lg:h-screen p-4 lg:p-5">
    <SongInfoDialog :is-open="songInfoOpen" :toggle-open="toggleSongInfoOpen" :info="songInfo" />
    <UiCard v-if="!isDesktop">
      <UiCardHeader class="flex flex-row p-0 pl-4 space-y-0">
        <UiButton variant="outline" size="icon" class="self-center" @click="showActions = !showActions">
          <ChevronDown v-if="!showActions" class="w-4 h-4" />
          <ChevronUp v-else class="w-4 h-4" />
        </UiButton>
        <TimeAvailability borderless class="w-full" @click="navigateTo('/manage/time')" />
      </UiCardHeader>
      <UiCardContent v-if="showActions" class="px-4 pb-4">
        <div class="flex flex-row items-center space-x-1 rounded-md text-secondary-foreground mt-2">
          <UiDropdownMenu>
            <UiDropdownMenuTrigger as-child>
              <UiButton variant="outline" class="basis-1/3 px-2 shadow-none">
                <span class="w-16">
                  {{ autoArrangeScopeText[autoArrangeScopeLength] }}
                </span>
                <ChevronDown class="h-4 w-4 ml-1 text-secondary-foreground" />
              </UiButton>
            </UiDropdownMenuTrigger>
          </UiDropdownMenu>
        </div>
      </UiCardContent>
    </UiCard>
    <client-only v-if="!isDesktop">
      <DatePicker
        v-model="date" mode="date" color="gray" locale="zh" view="weekly" :attributes="calendarAttr"
        :masks="{ title: 'YYYY MMM' }" class="rounded-lg border shadow-sm pb-3" expanded trim-weeks borderless is-required
      />
    </client-only>
    <UiCard v-if="isDesktop" class="lg:w-[600px] w-full relative hidden lg:block">
      <UiCardHeader>
        <UiCardTitle class="my-[-0.5rem]">
          <span class="icon-[tabler--list] mr-2" />
            日期选择
        </UiCardTitle>
      </UiCardHeader>
      <UiCardContent>
        <client-only>
          <DatePicker
            v-model="date" mode="date" color="gray" locale="zh" :attributes="calendarAttr"
            :masks="{ title: 'YYYY MMM' }" class="rounded-lg border pb-3" expanded trim-weeks borderless is-required
          />
          <template #fallback>
            <UiAspectRatio :ratio="1 / 0.95">
              <Loader2 class="w-8 h-8 mx-auto mt-[150px] animate-spin" />
            </UiAspectRatio>
          </template>
        </client-only>
      </UiCardContent>
    </UiCard>    
    
    <UiCard class="basis-1/2 pt-4 relative">
      <UiCardHeader class="flex flex-row align-top space-y-0 px-4 pt-3 lg:px-6 lg:pt-6">
        <UiCardTitle class="flex flex-row">
          <span class="icon-[tabler--list-details] mr-2" />
          {{ `${date.getMonth() + 1}-${date.getDate()}` }} 排歌表
        </UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="px-4 lg:px-6 overflow-hidden">
        <ContentLoading v-if="listLoading" class="lg:h-[calc(100vh-13rem)]" />
        <UiScrollArea v-else class="lg:h-[calc(100vh-13rem)]">
          <TransitionGroup name="list" tag="ul" class="flex flex-row w-max gap-2 lg:block lg:w-full">
            <UiTooltipProvider v-if="arrangement === undefined">
              暂未排歌
            </UiTooltipProvider>
            <div v-else>
              <li v-for="song in arrangement.songs" :key="song.id">
                <UiContextMenu>
                  <UiContextMenuTrigger>
                    <MusicCard
                      :compact="!isDesktop" :song="song" :selected="selectedSong === song" class="cursor-pointer w-[calc(100vw-6rem)] lg:w-full h-full"
                      @click="selectedSong = song; setSearchList()"
                    />
                  </UiContextMenuTrigger>
                </UiContextMenu>
              </li>
            </div>
          </TransitionGroup>
          <UiScrollBar v-if="!isDesktop" orientation="horizontal" />
        </UiScrollArea>
      </UiCardContent>
    </UiCard>

    <UiCard class="basis-3/4 pt-4">        
      <UiCardHeader class="items-start gap-4 space-y-0 flex-row px-4 pt-3 lg:px-6 lg:pt-6">
          <div class="space-y-1">
            <UiCardTitle class="flex flex-row">
              <span class="icon-[tabler--headphones] mr-2" />
              歌曲试听
            </UiCardTitle>
          </div>
          <UiButton variant="secondary" class="self-center my-[-10px] ml-auto" @click="navigateTo('/manage')">
            返回排歌模式
          </UiButton>
      </UiCardHeader>
      <UiCardContent class="px-4 lg:px-6">
        <UiScrollArea class="lg:h-[calc(100vh-10rem)]">
          <template v-if="!searchLoading">
            <div v-for="song in searchList" :key="albumid">
              <MusicPlayerCard :song="song" :compact="!isDesktop" />
            </div>
          </template>
          <template v-if="searchLoading && selectedSong">
            <UiCard v-for="n in 10" :key="n" class="flex items-center space-x-4 mb-2">
              <UiCardHeader class="items-start gap-4 space-y-0 flex-row w-full">
                <UiSkeleton class="h-20 w-20 rounded-sm" />
                <div class="space-y-2 w-full">
                  <UiSkeleton class="h-5 w-3/5" />
                  <UiSkeleton class="h-5 w-1/5" />
                  <UiSkeleton class="h-5 w-full" />
                </div>
              </UiCardHeader>
            </UiCard>
          </template>
        </UiScrollArea>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<style>
.calendar .vc-day:has(.vc-highlights) {
  background: transparent;
}

.vc-day-box-center-bottom {
  margin: 3px !important;
}

.vc-week {
  height: 48px !important;
}
</style>
