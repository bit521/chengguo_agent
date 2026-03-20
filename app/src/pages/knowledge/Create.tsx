import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { knowledgeService } from '@/services/knowledge';

export default function KnowledgeCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    embedding_model: 'text-embedding-3-small',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const kb = await knowledgeService.createKnowledgeBase(formData);
      navigate(`/knowledge/${kb.id}`);
    } catch (error) {
      console.error('创建知识库失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
        <div>
          <h1 className="text-xl font-bold">创建知识库</h1>
          <p className="text-xs text-muted-foreground">配置知识库基本信息和索引策略</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/knowledge')}>取消</Button>
          <Button form="kb-form" type="submit" disabled={loading}>
            {loading ? '创建中...' : '创建'}
          </Button>
        </div>
      </div>

      {/* 居中内容区 */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center">
        <form id="kb-form" onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>名称 *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="产品知识库"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="包含产品手册、FAQ等文档"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">索引配置</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Embedding 模型</Label>
                <Select
                  value={formData.embedding_model}
                  onValueChange={(v) => setFormData({ ...formData, embedding_model: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                    <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                    <SelectItem value="text-embedding-ada-002">text-embedding-ada-002</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
