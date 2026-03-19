import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Play, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { modelService } from '@/services/model';
import type { Model } from '@/services/types/model';

export default function ModelList() {
  const navigate = useNavigate();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('all');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    loadModels();
  }, [search, provider, status]);

  const loadModels = async () => {
    try {
      setLoading(true);
      const params: any = { pageSize: 20 };
      if (search) params.search = search;
      if (provider !== 'all') params.provider = provider;
      if (status !== 'all') params.status = status;
      
      const response = await modelService.getModels(params);
      setModels(response.data);
    } catch (error) {
      console.error('加载模型列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      available: 'default',
      unavailable: 'secondary',
      rate_limited: 'destructive',
    };
    const labels: Record<string, string> = {
      available: '可用',
      unavailable: '不可用',
      rate_limited: '限流中',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">模型管理</h1>
          <p className="text-muted-foreground mt-1">管理和配置AI模型</p>
        </div>
        <Button onClick={() => navigate('/models/providers')}>
          <Settings className="mr-2 h-4 w-4" />
          供应商管理
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总模型数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">可用模型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {models.filter((m) => m.status === 'available').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">提供商</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(models.map((m) => m.providerId)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总调用次数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {models.reduce((sum, m) => sum + m.callCount7d, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索模型名称或描述..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择提供商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部提供商</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="alibaba">阿里云</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="available">可用</SelectItem>
                <SelectItem value="unavailable">不可用</SelectItem>
                <SelectItem value="rate_limited">限流中</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模型名称</TableHead>
                <TableHead>提供商</TableHead>
                <TableHead>能力</TableHead>
                <TableHead>上下文长度</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>调用次数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : models.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>{model.providerName}</TableCell>
                    <TableCell>
                      {model.capabilities.map(cap => {
                        const labels: Record<string, string> = {
                          function_call: 'FC',
                          vision: 'Vision',
                          long_context: 'Long',
                          embedding: 'Embed',
                          streaming: 'Stream'
                        };
                        return labels[cap] || cap;
                      }).join(', ')}
                    </TableCell>
                    <TableCell>{model.contextLength.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>输入: ${model.inputPrice}/1K</div>
                        <div>输出: ${model.outputPrice}/1K</div>
                      </div>
                    </TableCell>
                    <TableCell>{model.callCount7d.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(model.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
