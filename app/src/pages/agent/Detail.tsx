import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Play, Pause, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { agentService } from '@/services/agent';
import type { Agent, AgentStats } from '@/services/types/agent';

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAgent();
    }
  }, [id]);

  const loadAgent = async () => {
    try {
      setLoading(true);
      const [agentData, statsData] = await Promise.all([
        agentService.getAgentDetail(id!),
        agentService.getAgentStats(id!),
      ]);
      setAgent(agentData);
      setStats(statsData);
    } catch (error) {
      console.error('加载Agent失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!agent) return;
    try {
      if (agent.status === 'active') {
        await agentService.stopAgent(agent.id);
      } else {
        await agentService.startAgent(agent.id);
      }
      loadAgent();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  if (loading || !agent) {
    return <div className="p-6">加载中...</div>;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive',
      draft: 'outline',
    };
    const labels: Record<string, string> = {
      active: '运行中',
      inactive: '已停止',
      error: '异常',
      draft: '草稿',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/agents')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-muted-foreground mt-1">{agent.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(agent.status)}
          <Button variant="outline" size="sm" onClick={() => navigate(`/agents/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
          <Button variant="outline" size="sm" onClick={handleToggleStatus}>
            {agent.status === 'active' ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                停止
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                启动
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/agents/${id}/test`)}>
            <Settings className="h-4 w-4 mr-2" />
            测试
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">今日调用</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayCalls.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">成功率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">平均延迟</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgLatency.toFixed(1)}s</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Token消耗</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tokenUsage.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">配置</TabsTrigger>
          <TabsTrigger value="versions">版本</TabsTrigger>
          <TabsTrigger value="logs">日志</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Agent类型</div>
                  <div className="font-medium">{agent.type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">使用模型</div>
                  <div className="font-medium">{agent.modelName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">版本</div>
                  <div className="font-medium">{agent.version}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">创建人</div>
                  <div className="font-medium">{agent.createdBy}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">创建时间</div>
                  <div className="font-medium">
                    {new Date(agent.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">更新时间</div>
                  <div className="font-medium">
                    {new Date(agent.updatedAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>模型配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Temperature</div>
                  <div className="font-medium">{agent.config.temperature || 0.7}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Max Tokens</div>
                  <div className="font-medium">{agent.config.maxTokens || 4096}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>版本历史</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">版本管理功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>运行日志</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">日志功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
