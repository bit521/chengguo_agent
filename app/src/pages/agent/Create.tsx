import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { agentService } from '@/services/agent';

export default function AgentCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'conversational',
    modelId: 'model-001',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    systemPrompt: '',
    ragEnabled: false,
    knowledgeBaseIds: [] as string[],
    retrievalStrategy: 'hybrid',
    topK: 5,
    similarityThreshold: 0.7,
    toolsEnabled: false,
    toolIds: [] as string[],
    welcomeMessage: '',
    suggestedQuestions: [] as string[],
    maxTurns: 20,
    timeout: 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await agentService.createAgent(formData);
      navigate('/agents');
    } catch (error) {
      console.error('创建Agent失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/agents')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div>
          <h1 className="text-3xl font-bold">创建Agent</h1>
          <p className="text-muted-foreground mt-1">配置新的AI Agent</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：智能客服助手"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Agent描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述Agent的功能和用途"
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Agent类型 *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversational">对话型</SelectItem>
                  <SelectItem value="tool">工具型</SelectItem>
                  <SelectItem value="analytical">分析型</SelectItem>
                  <SelectItem value="creative">创作型</SelectItem>
                  <SelectItem value="workflow">工作流</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>模型配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">选择模型 *</Label>
              <Select value={formData.modelId} onValueChange={(value) => setFormData({ ...formData, modelId: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="model-001">GPT-4</SelectItem>
                  <SelectItem value="model-002">GPT-3.5-Turbo</SelectItem>
                  <SelectItem value="model-003">Claude-3-Opus</SelectItem>
                  <SelectItem value="model-004">Claude-3-Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topP">Top P</Label>
                <Input
                  id="topP"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.topP}
                  onChange={(e) => setFormData({ ...formData, topP: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">系统提示词 *</Label>
              <Textarea
                id="systemPrompt"
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="定义Agent的角色、任务和约束条件"
                rows={6}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>知识库配置 (RAG)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ragEnabled">启用知识库检索</Label>
              <Switch
                id="ragEnabled"
                checked={formData.ragEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, ragEnabled: checked })}
              />
            </div>
            {formData.ragEnabled && (
              <>
                <div className="space-y-2">
                  <Label>检索策略</Label>
                  <Select value={formData.retrievalStrategy} onValueChange={(value) => setFormData({ ...formData, retrievalStrategy: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vector">向量检索</SelectItem>
                      <SelectItem value="fulltext">全文检索</SelectItem>
                      <SelectItem value="hybrid">混合检索</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topK">Top K</Label>
                    <Input
                      id="topK"
                      type="number"
                      value={formData.topK}
                      onChange={(e) => setFormData({ ...formData, topK: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="similarityThreshold">相似度阈值</Label>
                    <Input
                      id="similarityThreshold"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.similarityThreshold}
                      onChange={(e) => setFormData({ ...formData, similarityThreshold: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>工具配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="toolsEnabled">启用工具调用</Label>
              <Switch
                id="toolsEnabled"
                checked={formData.toolsEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, toolsEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>高级配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">开场白</Label>
              <Textarea
                id="welcomeMessage"
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                placeholder="Agent的第一句话"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxTurns">对话轮数限制</Label>
                <Input
                  id="maxTurns"
                  type="number"
                  value={formData.maxTurns}
                  onChange={(e) => setFormData({ ...formData, maxTurns: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">超时时间(秒)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={formData.timeout}
                  onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/agents')}>
            取消
          </Button>
          <Button type="button" variant="outline" disabled={loading}>
            保存草稿
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '创建中...' : '创建并发布'}
          </Button>
        </div>
      </form>
    </div>
  );
}
