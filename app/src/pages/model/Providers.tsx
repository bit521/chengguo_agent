import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ModelProviders() {
  const [providers] = useState([
    { id: "1", name: "OpenAI", status: "connected", modelCount: 3 },
    { id: "2", name: "Claude", status: "connected", modelCount: 2 },
    { id: "3", name: "阿里云", status: "connected", modelCount: 2 },
    { id: "4", name: "本地部署", status: "connected", modelCount: 1 },
    { id: "5", name: "Azure", status: "disconnected", modelCount: 0 },
    { id: "6", name: "自定义", status: "disconnected", modelCount: 0 },
  ]);

  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">供应商管理</h1>
          <p className="text-muted-foreground">配置和管理模型供应商</p>
        </div>
        <Button>添加供应商</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{provider.name}</span>
                {provider.status === "connected" ? (
                  <Badge>已连接</Badge>
                ) : (
                  <Badge variant="outline">未配置</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {provider.modelCount}个模型
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowConfig(!showConfig)}
              >
                配置
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {showConfig && (
        <Card>
          <CardHeader>
            <CardTitle>配置 OpenAI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="sk-xxxxxxxxxxxxx" />
            </div>
            <div className="space-y-2">
              <Label>API端点</Label>
              <Input defaultValue="https://api.openai.com/v1" />
            </div>
            <div className="space-y-2">
              <Label>组织ID (可选)</Label>
              <Input placeholder="org-xxxxx" />
            </div>
            <div className="space-y-2">
              <Label>代理地址 (可选)</Label>
              <Input placeholder="http://proxy.example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>请求超时(秒)</Label>
                <Input type="number" defaultValue="30" />
              </div>
              <div className="space-y-2">
                <Label>最大重试次数</Label>
                <Input type="number" defaultValue="3" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>负载均衡</Label>
              <div className="space-y-2">
                <div className="flex gap-2 items-center p-3 border rounded-lg">
                  <span className="flex-1 text-sm">Key 1: sk-xxx...xxx</span>
                  <span className="text-sm text-muted-foreground">权重: 50%</span>
                  <Button variant="ghost" size="sm">
                    删除
                  </Button>
                </div>
                <div className="flex gap-2 items-center p-3 border rounded-lg">
                  <span className="flex-1 text-sm">Key 2: sk-yyy...yyy</span>
                  <span className="text-sm text-muted-foreground">权重: 50%</span>
                  <Button variant="ghost" size="sm">
                    删除
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  添加Key
                </Button>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline">测试连接</Button>
              <Button variant="outline" onClick={() => setShowConfig(false)}>
                取消
              </Button>
              <Button>保存</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
