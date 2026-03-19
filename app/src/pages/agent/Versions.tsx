import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AgentVersions() {
  const [versions] = useState([
    {
      version: "v1.3",
      publishedAt: "2026-02-07 14:30",
      publishedBy: "admin",
      status: "current",
      changelog: "优化系统提示词",
    },
    {
      version: "v1.2",
      publishedAt: "2026-02-05 10:15",
      publishedBy: "admin",
      status: "history",
      changelog: "添加RAG知识库",
    },
    {
      version: "v1.1",
      publishedAt: "2026-02-01 16:20",
      publishedBy: "admin",
      status: "history",
      changelog: "调整Temperature参数",
    },
    {
      version: "v1.0",
      publishedAt: "2026-01-28 09:00",
      publishedBy: "admin",
      status: "history",
      changelog: "初始版本",
    },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">版本管理</h1>
          <p className="text-muted-foreground">智能客服Agent的版本历史</p>
        </div>
        <Button>版本对比</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>版本列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>版本</TableHead>
                <TableHead>发布时间</TableHead>
                <TableHead>发布人</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>变更说明</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.version}>
                  <TableCell className="font-medium">{version.version}</TableCell>
                  <TableCell>{version.publishedAt}</TableCell>
                  <TableCell>{version.publishedBy}</TableCell>
                  <TableCell>
                    {version.status === "current" ? (
                      <Badge>当前版本</Badge>
                    ) : (
                      <Badge variant="outline">历史版本</Badge>
                    )}
                  </TableCell>
                  <TableCell>{version.changelog}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        查看
                      </Button>
                      {version.status !== "current" && (
                        <Button variant="ghost" size="sm">
                          回滚
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>版本对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">v1.2</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg">
                {`# 角色设定
你是一个客服人员

# 任务要求
1. 友好专业
2. 准确回答`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">v1.3</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg">
                {`# 角色设定
你是辰光科技的专业客服人员

# 任务要求
1. 友好专业
2. 准确回答
3. 必要时转人工`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
