import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { promptService } from '@/services/prompt';
import type { PromptVariableSchema } from '@/services/prompt';

export default function PromptCreate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'customer-service',
    tags: [] as string[],
    content: `# 角色设定\n你是{{company}}的专业客服人员。\n\n# 任务要求\n1. 友好专业\n2. 准确回答\n\n当前产品: {{product}}`,
    variables: [] as PromptVariableSchema[],
  });
  const [newTag, setNewTag] = useState('');
  const [newVar, setNewVar] = useState<PromptVariableSchema>({
    name: '', type: 'string', description: '', required: true,
  });

  useEffect(() => { if (id) loadPrompt(); }, [id]);

  const loadPrompt = async () => {
    try {
      const p = await promptService.getPrompt(Number(id));
      setFormData({ name: p.name, description: p.description ?? '', category: p.category, tags: p.tags, content: p.content, variables: p.variables });
    } catch (error) { console.error('加载Prompt失败:', error); }
  };

  const handleSave = async (publish = false) => {
    try {
      setLoading(true);
      if (id) {
        await promptService.updatePrompt(Number(id), formData);
        if (publish) await promptService.publishPrompt(Number(id));
      } else {
        const created = await promptService.createPrompt(formData);
        if (publish) await promptService.publishPrompt(created.id);
      }
      navigate('/prompts');
    } catch (error) { console.error('保存Prompt失败:', error); }
    finally { setLoading(false); }
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });
      setNewTag('');
    }
  };
  const removeTag = (tag: string) =>
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  const addVariable = () => {
    if (newVar.name && newVar.description) {
      setFormData({ ...formData, variables: [...formData.variables, { ...newVar }] });
      setNewVar({ name: '', type: 'string', description: '', required: true });
    }
  };
  const removeVariable = (name: string) =>
    setFormData({ ...formData, variables: formData.variables.filter((v) => v.name !== name) });
  const previewContent = formData.content.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = formData.variables.find((v) => v.name === key);
    return v?.default_value ?? `[${key}]`;
  });

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
        <div>
          <h1 className="text-xl font-bold">{id ? '编辑' : '创建'} Prompt</h1>
          <p className="text-xs text-muted-foreground">配置 Prompt 模板和变量</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/prompts')}>取消</Button>
          <Button variant="outline" disabled={loading} onClick={() => handleSave(false)}>保存草稿</Button>
          <Button disabled={loading} onClick={() => handleSave(true)}>发布</Button>
        </div>
      </div>

      {/* 两栏 */}
      <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
        {/* 左：表单 */}
        <div className="overflow-y-auto p-6 space-y-4 border-r">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>名称 *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="客服对话模板" />
              </div>
              <div className="space-y-1.5">
                <Label>描述</Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="简要描述此 Prompt 的用途" />
              </div>
              <div className="space-y-1.5">
                <Label>分类</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer-service">客服</SelectItem>
                    <SelectItem value="development">开发</SelectItem>
                    <SelectItem value="marketing">营销</SelectItem>
                    <SelectItem value="analysis">分析</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>标签</Label>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} className="cursor-pointer" onClick={() => removeTag(tag)}>{tag} ×</Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="添加标签"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                  <Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Prompt 内容</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[180px] font-mono text-sm" placeholder="使用 {{变量名}} 插入变量" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">变量定义</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {formData.variables.map((v) => (
                <div key={v.name} className="flex items-center gap-2 p-2 border rounded text-sm">
                  <span className="font-mono font-medium">{`{{${v.name}}}`}</span>
                  <Badge variant="outline">{v.type}</Badge>
                  <span className="text-muted-foreground flex-1">{v.description}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeVariable(v.name)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <div className="grid grid-cols-5 gap-2">
                <Input placeholder="变量名" value={newVar.name} onChange={(e) => setNewVar({ ...newVar, name: e.target.value })} />
                <Select value={newVar.type} onValueChange={(v) => setNewVar({ ...newVar, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">string</SelectItem>
                    <SelectItem value="number">number</SelectItem>
                    <SelectItem value="boolean">boolean</SelectItem>
                    <SelectItem value="text">text</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="描述" value={newVar.description} onChange={(e) => setNewVar({ ...newVar, description: e.target.value })} className="col-span-2" />
                <Button type="button" variant="outline" onClick={addVariable}><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右：预览 */}
        <div className="overflow-y-auto p-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 shrink-0"><CardTitle className="text-base">预览 / 测试</CardTitle></CardHeader>
            <CardContent className="flex-1 min-h-0">
              <Tabs defaultValue="preview" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 shrink-0">
                  <TabsTrigger value="preview">预览</TabsTrigger>
                  <TabsTrigger value="variables">变量填写</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="flex-1 overflow-y-auto mt-2">
                  <div className="p-4 border rounded-lg bg-muted">
                    <pre className="text-sm whitespace-pre-wrap">{previewContent}</pre>
                  </div>
                </TabsContent>
                <TabsContent value="variables" className="space-y-3 mt-2 overflow-y-auto">
                  {formData.variables.length === 0 ? (
                    <p className="text-sm text-muted-foreground">暂无变量，在左侧添加变量后在此填写测试值</p>
                  ) : formData.variables.map((v) => (
                    <div key={v.name} className="space-y-1">
                      <Label>{v.name} <span className="text-muted-foreground text-xs">({v.description})</span></Label>
                      <Input placeholder={v.default_value ?? `输入 ${v.name}`} />
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
