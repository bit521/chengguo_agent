import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toolService } from '@/services/tool';

interface ToolParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export default function ToolCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'api',
    category: '其他',
    config: {
      method: 'GET',
      url: '',
      headers: {} as Record<string, string>,
      timeout: 10000,
    },
    parameters: [] as ToolParameter[],
  });

  const [newHeader, setNewHeader] = useState({ key: '', value: '' });
  const [newParam, setNewParam] = useState<ToolParameter>({
    name: '',
    type: 'string',
    required: true,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // 构建Function Definition
      const functionDef = {
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        description: formData.description,
        parameters: {
          type: 'object',
          properties: formData.parameters.reduce((acc, param) => {
            acc[param.name] = {
              type: param.type,
              description: param.description,
            };
            return acc;
          }, {} as Record<string, any>),
          required: formData.parameters.filter(p => p.required).map(p => p.name),
        },
      };

      await toolService.createTool({
        ...formData,
        function: functionDef,
      });
      navigate('/tools');
    } catch (error) {
      console.error('创建工具失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHeader = () => {
    if (newHeader.key && newHeader.value) {
      setFormData({
        ...formData,
        config: {
          ...formData.config,
          headers: {
            ...formData.config.headers,
            [newHeader.key]: newHeader.value,
          },
        },
      });
      setNewHeader({ key: '', value: '' });
    }
  };

  const removeHeader = (key: string) => {
    const { [key]: _, ...rest } = formData.config.headers;
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        headers: rest,
      },
    });
  };

  const addParameter = () => {
    if (newParam.name && newParam.description) {
      setFormData({
        ...formData,
        parameters: [...formData.parameters, { ...newParam }],
      });
      setNewParam({
        name: '',
        type: 'string',
        required: true,
        description: '',
      });
    }
  };

  const removeParameter = (index: number) => {
    setFormData({
      ...formData,
      parameters: formData.parameters.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tools')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div>
          <h1 className="text-3xl font-bold">注册工具</h1>
          <p className="text-muted-foreground mt-1">配置新的工具供Agent调用</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">工具名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：天气查询"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">工具描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述工具的功能和用途"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">工具类型 *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api">HTTP API</SelectItem>
                    <SelectItem value="function">自定义函数</SelectItem>
                    <SelectItem value="database">数据库</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">分类 *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="生活服务">生活服务</SelectItem>
                    <SelectItem value="数据处理">数据处理</SelectItem>
                    <SelectItem value="通讯">通讯</SelectItem>
                    <SelectItem value="AI服务">AI服务</SelectItem>
                    <SelectItem value="文件处理">文件处理</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {formData.type === 'api' && (
          <Card>
            <CardHeader>
              <CardTitle>HTTP API 配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="method">请求方法 *</Label>
                  <Select
                    value={formData.config.method}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, method: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="url">请求URL *</Label>
                  <Input
                    id="url"
                    value={formData.config.url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, url: e.target.value },
                      })
                    }
                    placeholder="https://api.example.com/endpoint"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>请求头</Label>
                <div className="space-y-2">
                  {Object.entries(formData.config.headers).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Input value={key} disabled className="flex-1" />
                      <Input value={value} disabled className="flex-1" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHeader(key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Header名称"
                      value={newHeader.key}
                      onChange={(e) => setNewHeader({ ...newHeader, key: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Header值"
                      value={newHeader.value}
                      onChange={(e) => setNewHeader({ ...newHeader, value: e.target.value })}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addHeader}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">超时时间(毫秒)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={formData.config.timeout}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, timeout: parseInt(e.target.value) },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>参数定义</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {formData.parameters.map((param, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-sm font-medium">{param.name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">{param.type}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        {param.required ? '必填' : '可选'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">{param.description}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParameter(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2">
              <Input
                placeholder="参数名"
                value={newParam.name}
                onChange={(e) => setNewParam({ ...newParam, name: e.target.value })}
              />
              <Select
                value={newParam.type}
                onValueChange={(value) => setNewParam({ ...newParam, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">string</SelectItem>
                  <SelectItem value="number">number</SelectItem>
                  <SelectItem value="boolean">boolean</SelectItem>
                  <SelectItem value="object">object</SelectItem>
                  <SelectItem value="array">array</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newParam.required ? 'true' : 'false'}
                onValueChange={(value) =>
                  setNewParam({ ...newParam, required: value === 'true' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">必填</SelectItem>
                  <SelectItem value="false">可选</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="参数描述"
                value={newParam.description}
                onChange={(e) => setNewParam({ ...newParam, description: e.target.value })}
              />
              <Button type="button" variant="outline" onClick={addParameter}>
                <Plus className="h-4 w-4 mr-2" />
                添加
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/tools')}>
            取消
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '创建中...' : '创建工具'}
          </Button>
        </div>
      </form>
    </div>
  );
}
