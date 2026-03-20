import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { knowledgeService } from '@/services/knowledge';
import type { SegmentRead } from '@/services/knowledge';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 5;

export default function KnowledgeSegments() {
  const { id } = useParams<{ id: string }>();
  const [segments, setSegments] = useState<SegmentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => { loadSegments(); }, [page, id]);

  const loadSegments = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await knowledgeService.getSegments(Number(id), { page, page_size: PAGE_SIZE });
      setSegments(res.items);
      setTotal(res.total);
    } catch (error) {
      console.error('加载分段失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (seg: SegmentRead) => {
    setEditingId(seg.id);
    setEditContent(seg.content);
  };

  const handleSave = async (seg: SegmentRead) => {
    try {
      await knowledgeService.updateSegment(Number(id), seg.id, { content: editContent });
      setEditingId(null);
      loadSegments();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">分段管理</h1>
          <p className="text-muted-foreground">共 {total} 个分段</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Input placeholder="搜索分段内容..." className="flex-1" />
      </div>

      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <div className="space-y-4">
          {segments.map((seg) => (
            <Card key={seg.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{seg.position}</Badge>
                    <span className="text-sm text-muted-foreground">字数: {seg.word_count}</span>
                    <span className="text-sm text-muted-foreground">Token: {seg.token_count}</span>
                    <span className="text-sm text-muted-foreground">命中: {seg.hit_count}次</span>
                  </div>
                  <div className="flex gap-2">
                    {editingId === seg.id ? (
                      <>
                        <Button size="sm" onClick={() => handleSave(seg)}>保存</Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>取消</Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(seg)}>编辑</Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === seg.id ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[100px] font-mono text-sm"
                  />
                ) : (
                  <p className="text-sm">{seg.content}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  );
}
