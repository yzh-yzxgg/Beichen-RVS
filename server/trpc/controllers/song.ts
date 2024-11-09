import { LibsqlError } from '@libsql/client';
import { and, eq, gt, inArray, or } from 'drizzle-orm';
import { type TNewSong, db } from '../../db/db';
import { songs } from '~/server/db/schema';
import type { TStatus } from '~/types';

export class SongController {
  async create(newSong: TNewSong) {
    const lastSong = await db.select().from(songs).where(
      and(
        eq(songs.submitterName, newSong.submitterName),
        eq(songs.submitterClass, newSong.submitterClass),
        eq(songs.submitterGrade, newSong.submitterGrade),
        gt(songs.createdAt, new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
      ),
    );
    const sameSong = await db.select().from(songs).where(
      and(
        eq(songs.name, newSong.name),
        or(
          // Last week
          and(
            gt(songs.createdAt, new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
            eq(songs.status, 'used'),
          ),
          // This week
          gt(songs.createdAt, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
        ),
      ),
    );

    if (sameSong.length && sameSong[0].status === 'used')
      return { success: false, message: '上周放过的不能再投稿哦' };
    else if (sameSong.length)
      return { success: false, message: '本周已投稿的歌不能再投稿哦' };

    try {
      const id = (await db.insert(songs).values({ ...newSong, votesum: 0 }).returning({ id: songs.id }))[0].id;
      return { success: true, res: id, message: '创建成功！' };
    } catch (err) {
      if (err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
        return { success: false, message: '歌曲ID出现重复' };
      else return { success: false, message: '服务器内部错误' };
    }
  }

  async remove(id: string) {
    try {
      await db.delete(songs).where(eq(songs.id, id));
      return { success: true, message: '删除成功' };
    } catch (err) {
      return { success: false, message: '歌曲不存在' };
    }
  }

  async getContent(id: string) {
    try {
      const res = (await db.select().from(songs).where(eq(songs.id, id)))[0];
      return { success: true, res, message: '获取成功' };
    } catch (err) {
      return { success: false, message: '歌曲不存在' };
    }
  }

  async modifyStatus(id: string, status: TStatus) {
    try {
      await db.update(songs).set({ status }).where(eq(songs.id, id));
      return { success: true, message: '修改成功' };
    } catch (err) {
      return { success: false, message: '歌曲不存在' };
    }
  }

  async batchModifyStatus(ids: string[], status: TStatus) {
    try {
      await db.update(songs).set({ status }).where(inArray(songs.id, ids));
      return { success: true, message: '修改成功' };
    } catch (err) {
      return { success: false, message: '歌曲不存在' };
    }
  }

  async getList() {
    try {
      const res = await db.select().from(songs).where(gt(songs.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
      return { success: true, res, message: '获取成功' };
    } catch (err) {
      return { success: false, message: '服务器内部错误' };
    }
  }

  async voteSong(id: string, session: string) {
    try {
      // 获取当前歌曲信息
      const song = (await db.select().from(songs).where(eq(songs.id, id)))[0];
      if (!song) {
        return { success: false, message: '歌曲不存在' };
      }

      // 检查用户是否已经投票
      const voteUsers = song.voteuser ? song.voteuser.split(',') : [];
      if (voteUsers.includes(session)) {
        return { success: false, message: '你已经投过票了' };
      }

      // 更新投票总数和投票用户列表
      voteUsers.push(session);
      const updatedVoteUser = voteUsers.join(',');
      await db.update(songs)
        .set({
          votesum: song.votesum + 1,
          voteuser: updatedVoteUser,
        })
        .where(eq(songs.id, id));

      return { success: true, message: '投票成功' };
    } catch (err) {
      return { success: false, message: '服务器内部错误' };
    }
  }
}
