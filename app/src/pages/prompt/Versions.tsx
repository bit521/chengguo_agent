import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PromptVersions() {
  const { id } = useParams();
  const [versions] = useState([
    { version: "v2.0", updatedAt: "2026-02-07", updatedBy: "admin", changelog: "重构角色设定", status: "current" },
    { version: "v1.5", updatedAt: "2026-02-03", updatedBy: "admin", changelog: "添加约束条件", status: "history" },
    { version: "v1.4", updatedAt: "2026-01-28", updatedBy: "admin", changelog: "优化输出格式", status: "history" },
    { version: "v1.3", updatedAt: "2026-01-20", updatedBy: "admin", changelog: "添加变量支持", status: "history" },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prompt版本管理</h1>
          <p className="text-muted-foreground">查看和对比Prompt版本</p>
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
                <TableHead>更新时间</TableHead>
                <TableHead>更新人</TableHead>
                <TableHead>变更说明</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((v) => (
                <TableRow key={v.version}>
                  <TableCell className="font-medium">{v.version}</TableCell>
                  <TableCell>{v.updatedAt}</TableCell>
                  <TableCell>{v.updatedBy}</TableCell>
                  <TableCell>{v.changelog}</TableCell>
                  <TableCell>
                    {v.status === "current" ? <Badge>当前版本</Badge> : <Badge variant="outline">历史版本</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">查看</Button>
                      <Button variant="ghost" size="sm">对比</Button>
                      {v.status !== "current" && <Button variant="ghost" size="sm">回滚</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
