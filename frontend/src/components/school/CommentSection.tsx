import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { comments as commentsApi } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import type { Comment } from '../../types';

export default function CommentSection({ schoolId }: { schoolId: number }) {
  const { user, token } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  const fetchComments = useCallback(() => {
    setLoading(true);
    commentsApi.list(schoolId, { page_size: 50 })
      .then(res => {
        if (res.data.success) {
          setComments(res.data.data);
          setTotal(res.data.pagination?.total || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [schoolId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async () => {
    if (!content.trim()) { setError('请输入评论内容'); return; }
    if (content.length > 1000) { setError('评论内容不能超过1000字'); return; }
    setSubmitting(true);
    setError('');
    try {
      await commentsApi.create(schoolId, content.trim());
      setContent('');
      fetchComments();
    } catch {
      setError('发表失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async (commentId: number) => {
    try {
      await commentsApi.delete(commentId);
      setDeleteId(null);
      fetchComments();
    } catch { setError('删除失败，请重试'); }
  };

  const formatTime = (t: string) => {
    const d = new Date(t);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">评论区 ({total})</h2>
      </div>

      {/* Input */}
      {token ? (
        <div className="mb-6">
          <textarea
            value={content}
            onChange={e => { setContent(e.target.value); setError(''); }}
            placeholder="分享你对该院校的看法、经验或问题..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{content.length}/1000</span>
            <div className="flex items-center gap-3">
              {error && <span className="text-red-500 text-xs">{error}</span>}
              <button
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                className="px-5 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {submitting ? '发表中...' : '发表评论'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
          请先<Link to="/login" className="text-blue-500 hover:text-blue-600 mx-1">登录</Link>后发表评论
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">加载评论中...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">暂无评论，来发表第一条评论吧</div>
      ) : (
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm flex-shrink-0">
                {c.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{c.username}</span>
                  <span className="text-xs text-gray-400">{formatTime(c.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words">{c.content}</p>
              </div>
              {(user?.id === c.user_id || user?.role === 'admin') && (
                <button
                  onClick={() => setDeleteId(c.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  title="删除"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 mx-4 max-w-sm w-full z-10 animate-fade-in">
            <h3 className="font-bold text-gray-800">确认删除</h3>
            <p className="text-sm text-gray-500 mt-2">确定要删除这条评论吗？此操作不可撤销。</p>
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                取消
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
